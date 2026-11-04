import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      showToast('Welcome back to HomeServe!', 'success');
      switch (res.user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'provider':
          navigate('/provider/dashboard');
          break;
        case 'technician':
          navigate('/technician/dashboard');
          break;
        case 'customer':
        default:
          navigate('/customer/dashboard');
          break;
      }
    } else {
      showToast(res.message || 'Invalid credentials', 'error');
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            {/* Quick Demo Credentials Card */}
            <div className="hs-card p-3 mb-3 bg-white border border-primary border-opacity-25 shadow-sm">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-lightning-charge-fill text-warning fs-5"></i>
                <span className="fw-bold small text-dark">One-Click Role Demo Sign-in:</span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger rounded-pill fw-semibold"
                  onClick={() => fillDemoAccount('admin@homeserve.tech', 'AdminPassword123!')}
                >
                  Admin
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill fw-semibold"
                  onClick={() => fillDemoAccount('apex.homes@homeserve.tech', 'ProviderPassword123!')}
                >
                  Provider
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info rounded-pill fw-semibold"
                  onClick={() => fillDemoAccount('rahul.tech@homeserve.tech', 'TechPassword123!')}
                >
                  Technician
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success rounded-pill fw-semibold"
                  onClick={() => fillDemoAccount('john.doe@gmail.com', 'CustomerPassword123!')}
                >
                  Customer
                </button>
              </div>
            </div>

            {/* Main Login Card */}
            <div className="hs-card p-4 p-md-5 bg-white shadow-md">
              <div className="text-center mb-4">
                <div
                  className="rounded-3 bg-primary text-white d-inline-flex align-items-center justify-content-center mb-2"
                  style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
                >
                  <i className="bi bi-tools"></i>
                </div>
                <h4 className="fw-bold text-dark mb-1">Sign In to HomeServe</h4>
                <p className="text-muted small">Access your role-specific portal & bookings</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold text-dark mb-0">Password</label>
                    <a href="#" className="small text-primary text-decoration-none">Forgot password?</a>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold rounded-3 mb-3 shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </button>
              </form>

              <div className="text-center pt-3 border-top small text-muted">
                Don't have an account yet?{' '}
                <Link to="/register" className="fw-bold text-primary text-decoration-none">
                  Create an Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
