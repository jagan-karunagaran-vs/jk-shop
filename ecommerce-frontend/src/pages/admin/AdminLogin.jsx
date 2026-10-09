import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLoginUser } from '../../redux/thunks/authThunks';
import { clearError } from '../../redux/slices/authSlice';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Username is required';
    if (!password) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedEmail = email.includes('@')
      ? email.trim()
      : `${email.trim()}@admin.jkshop.internal`;

    dispatch(adminLoginUser({ email: normalizedEmail, password }));
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h2>JK Shop Admin</h2>
        <p className="admin-login-subtitle">Restricted access</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          <div className="form-group">
            <label htmlFor="admin-username">Username</label>
            <input
              type="text"
              id="admin-username"
              name="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={formErrors.email ? 'input-error' : ''}
              autoComplete="username"
            />
            {formErrors.email && <span className="field-error">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              type="password"
              id="admin-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={formErrors.password ? 'input-error' : ''}
              autoComplete="current-password"
            />
            {formErrors.password && <span className="field-error">{formErrors.password}</span>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;