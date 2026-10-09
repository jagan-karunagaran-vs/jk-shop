import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../redux/thunks/authThunks';
import { clearError } from '../redux/slices/authSlice';

const Login = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const redirectPath = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, redirectPath]);

  useEffect(() => {
    dispatch(clearError());
    setFormErrors({});
  }, [mode, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};

    if (mode === 'register' && !formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (mode === 'login') {
      dispatch(loginUser({ email: formData.email.trim(), password: formData.password }));
    } else {
      dispatch(
        registerUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        })
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-brand">JK Shop</div>
        <h2>{mode === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="login-name">Full Name</label>
              <input
                type="text"
                id="login-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={formErrors.name ? 'input-error' : ''}
              />
              {formErrors.name && <span className="field-error">{formErrors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              type="email"
              id="login-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={formErrors.email ? 'input-error' : ''}
            />
            {formErrors.email && <span className="field-error">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={formErrors.password ? 'input-error' : ''}
            />
            {formErrors.password && <span className="field-error">{formErrors.password}</span>}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="login-confirm-password">Confirm Password</label>
              <input
                type="password"
                id="login-confirm-password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={formErrors.confirmPassword ? 'input-error' : ''}
              />
              {formErrors.confirmPassword && (
                <span className="field-error">{formErrors.confirmPassword}</span>
              )}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? mode === 'login'
                ? 'Logging in...'
                : 'Creating account...'
              : mode === 'login'
              ? 'Login'
              : 'Register'}
          </button>
        </form>

        <p className="login-toggle-text">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            className="login-toggle-btn"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>

        <Link to="/" className="login-back-link">← Back to shopping</Link>
      </div>
    </div>
  );
};

export default Login;