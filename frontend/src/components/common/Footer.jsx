import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '36px', height: '36px', fontSize: '1.2rem' }}
              >
                <i className="bi bi-tools"></i>
              </div>
              <span className="fw-bolder fs-5 text-white">HomeServe Technologies</span>
            </div>
            <p className="text-secondary small pe-lg-4">
              India's premier on-demand home service marketplace connecting certified electricians,
              plumbers, deep cleaning crews, and appliance specialists with residential and commercial clients.
            </p>
            <div className="d-flex gap-2 mt-3">
              <a href="#" className="btn btn-sm btn-outline-secondary rounded-circle text-white p-2" style={{ width: '34px', height: '34px' }}>
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="btn btn-sm btn-outline-secondary rounded-circle text-white p-2" style={{ width: '34px', height: '34px' }}>
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="btn btn-sm btn-outline-secondary rounded-circle text-white p-2" style={{ width: '34px', height: '34px' }}>
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="btn btn-sm btn-outline-secondary rounded-circle text-white p-2" style={{ width: '34px', height: '34px' }}>
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-white text-uppercase tracking-wider small mb-3">Services</h6>
            <ul className="list-unstyled small text-secondary">
              <li className="mb-2"><Link to="/services?category=electrical-services" className="text-secondary text-decoration-none hover-white">Electrical Repair</Link></li>
              <li className="mb-2"><Link to="/services?category=plumbing-solutions" className="text-secondary text-decoration-none hover-white">Plumbing Solutions</Link></li>
              <li className="mb-2"><Link to="/services?category=ac-hvac-maintenance" className="text-secondary text-decoration-none hover-white">AC Jet Servicing</Link></li>
              <li className="mb-2"><Link to="/services?category=deep-cleaning" className="text-secondary text-decoration-none hover-white">Deep Home Cleaning</Link></li>
              <li className="mb-2"><Link to="/services?category=pest-control" className="text-secondary text-decoration-none hover-white">Herbal Pest Control</Link></li>
            </ul>
          </div>

          {/* For Partners */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="fw-bold text-white text-uppercase tracking-wider small mb-3">For Partners</h6>
            <ul className="list-unstyled small text-secondary">
              <li className="mb-2"><Link to="/register?role=provider" className="text-secondary text-decoration-none hover-white">Register as Provider</Link></li>
              <li className="mb-2"><Link to="/login" className="text-secondary text-decoration-none hover-white">Provider Dashboard</Link></li>
              <li className="mb-2"><Link to="/login" className="text-secondary text-decoration-none hover-white">Technician Mobility</Link></li>
              <li className="mb-2"><Link to="/login" className="text-secondary text-decoration-none hover-white">Admin Governance</Link></li>
              <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-white">Safety Standards</a></li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white text-uppercase tracking-wider small mb-3">Platform Guarantee</h6>
            <div className="bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-3 p-3 text-secondary small">
              <div className="d-flex align-items-center gap-2 mb-2 text-white fw-semibold">
                <i className="bi bi-shield-check text-success fs-5"></i>
                <span>100% Verified Professionals</span>
              </div>
              <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                Every service professional undergoes police verification, background validation, and trade skill testing.
              </p>
            </div>
            <div className="mt-3 text-secondary small">
              <i className="bi bi-telephone-fill me-2 text-primary"></i> 24x7 Support: 1800-419-8800
            </div>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
          <p className="mb-2 mb-md-0">
            &copy; {new Date().getFullYear()} HomeServe Technologies Inc. All rights reserved.
          </p>
          <div className="d-flex gap-3">
            <a href="#" className="text-secondary text-decoration-none">Privacy Policy</a>
            <a href="#" className="text-secondary text-decoration-none">Terms of Service</a>
            <a href="#" className="text-secondary text-decoration-none">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
