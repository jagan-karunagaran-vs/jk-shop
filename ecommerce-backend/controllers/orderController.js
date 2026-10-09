const Order = require('../models/order');
const Product = require('../models/product');
const { AppError } = require('../middleware/errorHandler');
const { calculateOrderPricing, getEffectiveUnitPrice } = require('../utils/orderPricing');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return next(new AppError('No order items provided', 400));
    }

    if (!shippingAddress || !paymentMethod) {
      return next(new AppError('Please provide shipping address and payment method', 400));
    }

    const requiredAddressFields = ['street', 'city', 'state', 'zipCode', 'country'];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field] || !String(shippingAddress[field]).trim()) {
        return next(new AppError(`Shipping address is missing "${field}"`, 400));
      }
    }

    const validPaymentMethods = ['CreditCard', 'PayPal', 'CashOnDelivery'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return next(new AppError('Invalid payment method', 400));
    }

    // SECURITY FIX: never trust client-sent prices/totals. Rebuild every
    // order item from the current DB record (price, name, image, stock),
    // and recompute itemsPrice/taxPrice/shippingPrice/totalPrice server-side.
    // The client's own price/name/image/itemsPrice/taxPrice/etc. fields,
    // if present in req.body, are ignored entirely.
    const verifiedOrderItems = [];
    let itemsPrice = 0;

    for (const clientItem of orderItems) {
      if (!clientItem.product || !clientItem.quantity || clientItem.quantity < 1) {
        return next(new AppError('Each order item needs a valid product and quantity', 400));
      }

      const product = await Product.findById(clientItem.product);

      if (!product || !product.isActive) {
        return next(new AppError(`Product not available: ${clientItem.product}`, 404));
      }

      if (product.stock < clientItem.quantity) {
        return next(
          new AppError(
            `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
            400
          )
        );
      }

      const unitPrice = getEffectiveUnitPrice(product);

      verifiedOrderItems.push({
        product: product._id,
        name: product.name,
        quantity: clientItem.quantity,
        price: unitPrice,
        image: product.images?.[0]?.url || '',
      });

      itemsPrice += unitPrice * clientItem.quantity;
    }

    const pricing = calculateOrderPricing(itemsPrice);

    const order = await Order.create({
      user: req.user._id,
      orderItems: verifiedOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: pricing.itemsPrice,
      taxPrice: pricing.taxPrice,
      shippingPrice: pricing.shippingPrice,
      totalPrice: pricing.totalPrice,
    });

    // Decrement stock for each ordered product
    for (const item of verifiedOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Not authorized to view this order', 403));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's own orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('orderItems.product', 'name images');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');

    const total = await Order.countDocuments();

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return next(new AppError(`Order status must be one of: ${validStatuses.join(', ')}`, 400));
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // FIX: if an admin sets status to "Cancelled" through this endpoint
    // (as opposed to the dedicated /cancel route), restock exactly once,
    // and never restock an order that is already Cancelled.
    if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.orderStatus = orderStatus;

    if (orderStatus === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res, next) => {
  try {
    const { id, status, updateTime, email } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this order', 403));
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = { id, status, updateTime, email };

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order marked as paid',
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to cancel this order', 403));
    }

    // FIX: guard against double-cancellation, which previously could
    // restock the same order's items more than once if this endpoint
    // was called twice (e.g. double-click, retried request).
    if (order.orderStatus === 'Cancelled') {
      return next(new AppError('This order is already cancelled', 400));
    }

    if (['Shipped', 'Delivered'].includes(order.orderStatus)) {
      return next(new AppError(`Cannot cancel an order that is already ${order.orderStatus}`, 400));
    }

    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = 'Cancelled';
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderToPaid,
  cancelOrder,
};