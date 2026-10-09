import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section footer-brand">
          <h3>JK Shop</h3>
          <p>Thoughtfully chosen products, presented with care.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/orders">Orders</Link></li>
            <li><Link to="/help">Help</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p><a href="tel:+919080008236">📞 9080008236</a></p>
          <p>📍 Chennai, Tamil Nadu, India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} JK Shop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;