import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateAdminOrderStatus } from '../../redux/thunks/adminThunks';
import { formatCurrency } from '../../utils/formatCurrency';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, page, pages } = useSelector((state) => state.admin);
  const [filters, setFilters] = useState({ page: 1 });
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminOrders(filters));
  }, [dispatch, filters]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    await dispatch(updateAdminOrderStatus({ orderId, orderStatus: newStatus }));
    setUpdatingId(null);
  };

  return (
    <div className="admin-orders-page">
      <h2>Orders</h2>

      {loading && <p className="loading-text">Loading orders...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-orders-list">
            {orders.map((order) => (
              <div key={order._id} className="admin-order-card">
                <div
                  className="admin-order-card-header"
                  onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                >
                  <div>
                    <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                    <span className="admin-order-customer">{order.user?.name} ({order.user?.email})</span>
                  </div>
                  <span>{formatCurrency(order.totalPrice)}</span>
                  <div className="admin-order-status-control">
                    <label htmlFor={`status-${order._id}`} className="sr-only">
                      Update status for order {order._id}
                    </label>
                    <select
                      id={`status-${order._id}`}
                      name={`status-${order._id}`}
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={updatingId === order._id}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {expandedOrderId === order._id && (
                  <div className="admin-order-detail">
                    <p><strong>Payment:</strong> {order.paymentMethod} — {order.isPaid ? 'Paid' : 'Unpaid'}</p>
                    <p><strong>Shipping:</strong> {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}</p>
                    <div className="admin-order-items">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="admin-order-item-row">
                          <span>{item.name} x {item.quantity}</span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>Previous</button>
              <span>Page {page} of {pages}</span>
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= pages}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrders;