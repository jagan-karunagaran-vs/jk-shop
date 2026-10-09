import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../redux/thunks/adminThunks';
import { formatCurrency } from '../../utils/formatCurrency';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading && !stats) return <p className="loading-text">Loading dashboard...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!stats) return null;

  return (
    <div className="admin-dashboard">
      <h2>Dashboard</h2>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Products</span>
          <span className="admin-stat-value">{stats.totalProducts}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Customers</span>
          <span className="admin-stat-value">{stats.totalCustomers}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Orders</span>
          <span className="admin-stat-value">{stats.totalOrders}</span>
        </div>
        <div className="admin-stat-card warning">
          <span className="admin-stat-label">Low Stock (≤ {stats.lowStockThreshold})</span>
          <span className="admin-stat-value">{stats.lowStockCount}</span>
        </div>
        <div className="admin-stat-card success">
          <span className="admin-stat-label">Paid Revenue</span>
          <span className="admin-stat-value">{formatCurrency(stats.paidRevenue)}</span>
        </div>
        <div className="admin-stat-card pending">
          <span className="admin-stat-label">Pending COD Revenue</span>
          <span className="admin-stat-value">{formatCurrency(stats.pendingCodRevenue)}</span>
        </div>
      </div>

      <div className="admin-orders-by-status">
        <h3>Orders by Status</h3>
        <div className="admin-status-list">
          {stats.ordersByStatus.map((item) => (
            <div key={item._id} className="admin-status-row">
              <span>{item._id}</span>
              <span>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;