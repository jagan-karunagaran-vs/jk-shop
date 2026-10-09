import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders, cancelOrderThunk } from '../redux/thunks/orderThunks';
import { formatCurrency } from '../utils/formatCurrency';

const statusColors = {
  Pending: '#c98a1d',
  Processing: '#3a6ea5',
  Shipped: '#2f6690',
  Delivered: '#2e8b57',
  Cancelled: '#c0392b',
};

const Orders = () => {
  const dispatch = useDispatch();
  const { myOrders, loading, error } = useSelector((state) => state.orders);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancellingId(orderId);
    setCancelError(null);

    const result = await dispatch(cancelOrderThunk(orderId));

    setCancellingId(null);

    if (cancelOrderThunk.fulfilled.match(result)) {
      dispatch(fetchMyOrders());
    } else {
      setCancelError(result.payload || 'Failed to cancel order. Please try again.');
    }
  };

  if (loading && myOrders.length === 0) {
    return <p className="loading-text">Loading your orders...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (myOrders.length === 0) {
    return (
      <div className="orders-page empty">
        <h2>No orders yet</h2>
        <p className="empty-text">Once you place an order, it will show up here.</p>
        <Link to="/" className="btn-link">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h2>📦 My Orders</h2>

      {cancelError && <p className="error-text">{cancelError}</p>}

      <div className="orders-list">
        {myOrders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div>
                <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                <p className="order-card-date">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span
                className="order-status-badge"
                style={{ backgroundColor: statusColors[order.orderStatus] || '#888' }}
              >
                {order.orderStatus}
              </span>
            </div>

            <div className="order-card-items">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="order-card-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="order-card-pricing">
              <div className="order-card-pricing-row">
                <span>Items</span>
                <span>{formatCurrency(order.itemsPrice)}</span>
              </div>
              <div className="order-card-pricing-row">
                <span>Tax</span>
                <span>{formatCurrency(order.taxPrice)}</span>
              </div>
              <div className="order-card-pricing-row">
                <span>Shipping</span>
                <span>{order.shippingPrice === 0 ? 'Free' : formatCurrency(order.shippingPrice)}</span>
              </div>
            </div>

            <div className="order-card-footer">
              <span className="order-card-total">Total: {formatCurrency(order.totalPrice)}</span>

              {['Pending', 'Processing'].includes(order.orderStatus) && (
                <button
                  type="button"
                  className="order-cancel-btn"
                  onClick={() => handleCancel(order._id)}
                  disabled={cancellingId === order._id}
                >
                  {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;