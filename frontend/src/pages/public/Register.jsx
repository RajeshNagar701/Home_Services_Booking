import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState(searchParams.get('role') === 'provider' ? 'provider' : 'customer');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    city: 'Mumbai'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsLoading(true);
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role,
      ...(role === 'provider' && {
        businessName: formData.businessName,
        city: formData.city
      })
    };

    const res = await register(payload);
    setIsLoading(false);

    if (res.success) {
      showToast('Registration successful! Welcome to HomeServe.', 'success');
      if (role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      showToast(res.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-6">
            <div className="hs-card p-4 p-md-5 bg-white shadow-md">
              <div className="text-center mb-4">
                <div
                  className="rounded-3 bg-primary text-white d-inline-flex align-items-center justify-content-center mb-2"
                  style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
                >
                  <i className="bi bi-person-plus-fill"></i>
                </div>
                <h4 className="fw-bold text-dark mb-1">Create Your Account</h4>
                <p className="text-muted small">Join thousands of homeowners and verified service providers</p>

                {/* Role Tabs */}
                <div className="btn-group w-100 mt-2 p-1 bg-light rounded-pill border" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill fw-semibold ${role === 'customer' ? 'btn-primary' : 'text-muted'}`}
                    onClick={() => setRole('customer')}
                  >
                    <i className="bi bi-person me-1"></i> I am a Customer
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill fw-semibold ${role === 'provider' ? 'btn-primary' : 'text-muted'}`}
                    onClick={() => setRole('provider')}
                  >
                    <i className="bi bi-building me-1"></i> I am a Service Provider
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {role === 'provider' && (
                  <div className="row g-2 mb-3">
                    <div className="col-md-7">
                      <label className="form-label small fw-semibold text-dark">Business / Agency Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="businessName"
                        placeholder="e.g. Apex Electrical Solutions"
                        value={formData.businessName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-semibold text-dark">Primary Operating City *</label>
                      <select
                        className="form-select"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      >
                        <option value="Mumbai">Mumbai</option>
                        <option value="Pune">Pune</option>
                        <option value="Navi Mumbai">Navi Mumbai</option>
                        <option value="Thane">Thane</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Confirm Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
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
                      Registering Account...
                    </>
                  ) : (
                    `Complete ${role === 'provider' ? 'Provider' : 'Customer'} Registration`
                  )}
                </button>
              </form>

              <div className="text-center pt-3 border-top small text-muted">
                Already registered?{' '}
                <Link to="/login" className="fw-bold text-primary text-decoration-none">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
