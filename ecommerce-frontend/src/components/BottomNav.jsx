import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const BottomNav = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => (isActive ? 'bottom-nav-link active' : 'bottom-nav-link')} end>
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-label">Home</span>
      </NavLink>

      <NavLink to="/cart" className={({ isActive }) => (isActive ? 'bottom-nav-link active' : 'bottom-nav-link')}>
        <span className="bottom-nav-icon">
          🛒
          {cartCount > 0 && <span className="bottom-nav-badge">{cartCount}</span>}
        </span>
        <span className="bottom-nav-label">Cart</span>
      </NavLink>

      <NavLink to="/orders" className={({ isActive }) => (isActive ? 'bottom-nav-link active' : 'bottom-nav-link')}>
        <span className="bottom-nav-icon">📦</span>
        <span className="bottom-nav-label">Orders</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/orders' : '/login'}
        className={({ isActive }) => (isActive ? 'bottom-nav-link active' : 'bottom-nav-link')}
      >
        <span className="bottom-nav-icon">👤</span>
        <span className="bottom-nav-label">Account</span>
      </NavLink>

      <NavLink to="/help" className={({ isActive }) => (isActive ? 'bottom-nav-link active' : 'bottom-nav-link')}>
        <span className="bottom-nav-icon">💬</span>
        <span className="bottom-nav-label">Help</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;