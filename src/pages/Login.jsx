import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TouchButton } from '../components/ui/TouchButton';
import { theme } from '../styles/theme';
import { Logo } from '../components/Logo';
import './Login.css';

export const Login = () => {
  const [role, setRole] = useState('restaurant_admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, role);
      if (role === 'superadmin') {
        navigate('/super-admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <Link to="/" className="login-logo-link">
          <Logo size="xlarge" />
        </Link>
        <p className="brand-subtitle">Smart Restaurant Management, Simplified</p>
      </div>

      <div className="login-card">
        <h2 className="welcome-text">Welcome Back</h2>
        <p className="welcome-subtitle">Sign in to access your dashboard</p>

        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'restaurant_admin' ? 'active' : ''}`}
            onClick={() => setRole('restaurant_admin')}
          >
            Admin
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'superadmin' ? 'active' : ''}`}
            onClick={() => setRole('superadmin')}
          >
            Super Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => {
                  const input = document.getElementById('password');
                  input.type = input.type === 'password' ? 'text' : 'password';
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M1.66667 10C1.66667 10 4.16667 5 10 5C15.8333 5 18.3333 10 18.3333 10C18.3333 10 15.8333 15 10 15C4.16667 15 1.66667 10 1.66667 10Z"
                    stroke={theme.colors.text.secondary}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                    stroke={theme.colors.text.secondary}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <TouchButton
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            loading={loading}
            className="signin-btn"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </TouchButton>
        </form>

        {import.meta.env.DEV && (
          <div className="demo-credentials">
            <div className="divider"></div>
            <p className="demo-label">Quick Login</p>
            <button
              type="button"
              className="demo-fill-btn"
              onClick={() => { setEmail('superadmin@goresto.com'); setPassword('admin123'); setRole('superadmin'); }}
            >
              <span className="demo-fill-role">Super Admin</span>
              <span className="demo-fill-email">superadmin@goresto.com</span>
            </button>
            <button
              type="button"
              className="demo-fill-btn"
              onClick={() => { setEmail('owner@restaurant.com'); setPassword('owner123'); setRole('restaurant_admin'); }}
            >
              <span className="demo-fill-role">Restaurant Admin</span>
              <span className="demo-fill-email">owner@restaurant.com</span>
            </button>
          </div>
        )}

        <Link to="/" className="back-to-home">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 12L6 8L10 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

