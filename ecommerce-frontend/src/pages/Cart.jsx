import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CartItem from '../components/CartItem';
import { clearCart, saveShippingAddress, savePaymentMethod } from '../redux/slices/cartSlice';
import { placeOrder } from '../redux/thunks/orderThunks';
import { clearOrderSuccess, clearOrderError } from '../redux/slices/orderSlice';
import { formatCurrency } from '../utils/formatCurrency';
import { calculateOrderPricing } from '../utils/orderPricing';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, shippingAddress, paymentMethod } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.orders);

  const [step, setStep] = useState('cart');
  const [address, setAddress] = useState({
    street: shippingAddress.street || '',
    city: shippingAddress.city || '',
    state: shippingAddress.state || '',
    zipCode: shippingAddress.zipCode || '',
    country: shippingAddress.country || '',
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethod);

  const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calculateOrderPricing(cartItems);

  const handleProceedToShipping = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setStep('shipping');
  };

  const validateAddress = () => {
    const errors = {};
    const requiredFields = ['street', 'city', 'state', 'zipCode', 'country'];

    requiredFields.forEach((field) => {
      if (!address[field] || !address[field].trim()) {
        errors[field] = 'This field is required';
      }
    });

    if (address.zipCode && !/^[0-9A-Za-z\s-]{3,10}$/.test(address.zipCode.trim())) {
      errors.zipCode = 'Enter a valid postal/zip code';
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();

    if (!validateAddress()) {
      return;
    }

    dispatch(saveShippingAddress(address));
    dispatch(savePaymentMethod(selectedPaymentMethod));
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    dispatch(clearOrderError());

    const orderData = {
      orderItems: cartItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      shippingAddress: address,
      paymentMethod: selectedPaymentMethod,
    };

    const result = await dispatch(placeOrder(orderData));

    if (placeOrder.fulfilled.match(result)) {
      dispatch(clearCart());
      dispatch(clearOrderSuccess());
      navigate('/orders');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty">
        <h2>Your cart is empty</h2>
        <p className="empty-text">Browse our collection and find something you'll love.</p>
        <button onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>🛒 Shopping Cart</h2>

      <div className="checkout-steps" aria-hidden="true">
        <span className={step === 'cart' ? 'active' : ''}>1. Cart</span>
        <span className={step === 'shipping' ? 'active' : ''}>2. Shipping</span>
        <span className={step === 'review' ? 'active' : ''}>3. Review</span>
      </div>

      {step === 'cart' && (
        <div className="cart-step-layout">
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <CartItem key={item.product} item={item} />
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Items:</span>
              <span>{formatCurrency(itemsPrice)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Tax (8%):</span>
              <span>{formatCurrency(taxPrice)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping:</span>
              <span>{shippingPrice === 0 ? 'Free' : formatCurrency(shippingPrice)}</span>
            </div>
            <div className="cart-summary-row total">
              <span>Total:</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>

            <button onClick={handleProceedToShipping}>Proceed to Checkout</button>
          </div>
        </div>
      )}

      {step === 'shipping' && (
        <div className="checkout-panel-wrapper">
          <form onSubmit={handleShippingSubmit} className="shipping-form" noValidate>
            <h3>Shipping Address</h3>

            <div className="form-group">
              <label htmlFor="shipping-street">Street</label>
              <input
                type="text"
                id="shipping-street"
                name="street"
                value={address.street}
                onChange={(e) => setAddress((prev) => ({ ...prev, street: e.target.value }))}
                className={addressErrors.street ? 'input-error' : ''}
              />
              {addressErrors.street && <span className="field-error">{addressErrors.street}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="shipping-city">City</label>
              <input
                type="text"
                id="shipping-city"
                name="city"
                value={address.city}
                onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
                className={addressErrors.city ? 'input-error' : ''}
              />
              {addressErrors.city && <span className="field-error">{addressErrors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="shipping-state">State</label>
              <input
                type="text"
                id="shipping-state"
                name="state"
                value={address.state}
                onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
                className={addressErrors.state ? 'input-error' : ''}
              />
              {addressErrors.state && <span className="field-error">{addressErrors.state}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="shipping-zip">Zip / Postal Code</label>
              <input
                type="text"
                id="shipping-zip"
                name="zipCode"
                value={address.zipCode}
                onChange={(e) => setAddress((prev) => ({ ...prev, zipCode: e.target.value }))}
                className={addressErrors.zipCode ? 'input-error' : ''}
              />
              {addressErrors.zipCode && <span className="field-error">{addressErrors.zipCode}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="shipping-country">Country</label>
              <input
                type="text"
                id="shipping-country"
                name="country"
                value={address.country}
                onChange={(e) => setAddress((prev) => ({ ...prev, country: e.target.value }))}
                className={addressErrors.country ? 'input-error' : ''}
              />
              {addressErrors.country && <span className="field-error">{addressErrors.country}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="shipping-payment-method">Payment Method</label>
              <select
                id="shipping-payment-method"
                name="paymentMethod"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                <option value="CashOnDelivery">Cash on Delivery</option>
                <option value="CreditCard">Credit Card</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>

            <div className="shipping-form-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep('cart')}>
                Back
              </button>
              <button type="submit">Review Order</button>
            </div>
          </form>
        </div>
      )}

      {step === 'review' && (
        <div className="checkout-panel-wrapper">
          <div className="order-review">
            <h3>Review Your Order</h3>

            <div className="order-review-section">
              <h4>Shipping Address</h4>
              <p>
                {address.street}, {address.city}, {address.state} {address.zipCode},{' '}
                {address.country}
              </p>
            </div>

            <div className="order-review-section">
              <h4>Payment Method</h4>
              <p>{selectedPaymentMethod === 'CashOnDelivery' ? 'Cash on Delivery' : selectedPaymentMethod}</p>
            </div>

            <div className="order-review-section">
              <h4>Items</h4>
              {cartItems.map((item) => (
                <div key={item.product} className="order-review-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Items:</span>
                <span>{formatCurrency(itemsPrice)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Tax (8%):</span>
                <span>{formatCurrency(taxPrice)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping:</span>
                <span>{shippingPrice === 0 ? 'Free' : formatCurrency(shippingPrice)}</span>
              </div>
              <div className="cart-summary-row total">
                <span>Total:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="shipping-form-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep('shipping')}>
                Back
              </button>
              <button onClick={handlePlaceOrder} disabled={loading}>
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;