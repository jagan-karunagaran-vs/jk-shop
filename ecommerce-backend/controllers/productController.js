const Product = require('../models/product');
const { AppError } = require('../middleware/errorHandler');
const { getDiscountPercent, getEffectivePrice } = require('../utils/pricing');

const attachPricingInfo = (productDoc) => {
  const product = productDoc.toObject ? productDoc.toObject() : productDoc;
  const discountInfo = getDiscountPercent(product);
  return {
    ...product,
    effectivePrice: getEffectivePrice(product),
    discountPercent: discountInfo.roundedPercent,
    hasDiscount: discountInfo.hasDiscount,
  };
};

const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
      includeInactive,
    } = req.query;

    const query = {};

    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    if (keyword) {
      query.$text = { $search: keyword };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { 'ratings.average': -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products: products.map(attachPricingInfo),
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'reviews.user',
      'name avatar'
    );

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      product: attachPricingInfo(product),
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true }).limit(8);

    res.status(200).json({
      success: true,
      count: products.length,
      products: products.map(attachPricingInfo),
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      brand,
      stock,
      images,
      isFeatured,
      isBestSeller,
      isActive,
    } = req.body;

    if (!name || !description || !price || !category || stock === undefined) {
      return next(
        new AppError('Please provide name, description, price, category, and stock', 400)
      );
    }

    if (discountPrice && Number(discountPrice) >= Number(price)) {
      return next(new AppError('Discount price must be lower than the original price', 400));
    }

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice: discountPrice || 0,
      category,
      brand,
      stock,
      images: images || [],
      isFeatured: isFeatured || false,
      isBestSeller: isBestSeller || false,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: attachPricingInfo(product),
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const updatableFields = [
      'name',
      'description',
      'price',
      'discountPrice',
      'category',
      'brand',
      'stock',
      'images',
      'isFeatured',
      'isBestSeller',
      'isActive',
    ];

    const finalPrice = req.body.price !== undefined ? Number(req.body.price) : product.price;
    const finalDiscountPrice =
      req.body.discountPrice !== undefined ? Number(req.body.discountPrice) : product.discountPrice;

    if (finalDiscountPrice && finalDiscountPrice >= finalPrice) {
      return next(new AppError('Discount price must be lower than the original price', 400));
    }

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: attachPricingInfo(updatedProduct),
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product archived successfully',
    });
  } catch (error) {
    next(error);
  }
};

const addProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return next(new AppError('Please provide rating and comment', 400));
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return next(new AppError('You have already reviewed this product', 400));
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.ratings.count = product.reviews.length;
    product.ratings.average =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getCategories,
};