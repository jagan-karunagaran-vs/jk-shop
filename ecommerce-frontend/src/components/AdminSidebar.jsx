import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: '📊 Dashboard', end: true },
    { to: '/admin/products', label: '📦 Products' },
    { to: '/admin/orders', label: '🧾 Orders' },
    { to: '/admin/customers', label: '👥 Customers' },
    { to: '/admin/messages', label: '💬 Messages' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">JK Shop Admin</div>

      <nav className="admin-sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <p className="admin-sidebar-username">{user?.name}</p>
        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;