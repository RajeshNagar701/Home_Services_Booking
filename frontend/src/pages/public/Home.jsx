import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, srvRes] = await Promise.all([
          api.get('/categories'),
          api.get('/services?limit=6&sort=popular')
        ]);
        if (catRes.success) setCategories(catRes.data);
        if (srvRes.success) setPopularServices(srvRes.data);
      } catch (err) {
        console.warn('Error fetching homepage data, using fallback data:', err.message);
        // Fallback default categories if offline
        setCategories([
          { _id: '1', name: 'Electrical Services', slug: 'electrical-services', icon: 'bi-lightning-charge', servicesCount: 6 },
          { _id: '2', name: 'Plumbing Solutions', slug: 'plumbing-solutions', icon: 'bi-droplet-half', servicesCount: 8 },
          { _id: '3', name: 'AC & HVAC Servicing', slug: 'ac-hvac-maintenance', icon: 'bi-fan', servicesCount: 5 },
          { _id: '4', name: 'Deep Cleaning', slug: 'deep-cleaning', icon: 'bi-stars', servicesCount: 12 },
          { _id: '5', name: 'Appliance Repair', slug: 'appliance-repair', icon: 'bi-tv', servicesCount: 7 },
          { _id: '6', name: 'Pest Control', slug: 'pest-control', icon: 'bi-shield-check', servicesCount: 4 }
        ]);
        setPopularServices([
          {
            _id: 's1',
            title: 'Split & Window AC Deep Jet Servicing & Gas Top-Up',
            slug: 'ac-deep-jet-servicing',
            price: 999,
            discountPrice: 849,
            rating: 4.9,
            durationMinutes: 60,
            coverImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80',
            provider: { businessName: 'Apex Home Solutions' }
          },
          {
            _id: 's2',
            title: '3BHK Eco-Friendly Deep Home Cleaning & Sanitization',
            slug: '3bhk-deep-cleaning-sanitization',
            price: 3499,
            discountPrice: 2899,
            rating: 4.9,
            durationMinutes: 240,
            coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
            provider: { businessName: 'SparkleClean Facility Management' }
          },
          {
            _id: 's3',
            title: 'Complete Home Electrical Safety Inspection & Wiring Repair',
            slug: 'electrical-inspection-wiring-repair',
            price: 799,
            discountPrice: 649,
            rating: 4.8,
            durationMinutes: 90,
            coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
            provider: { businessName: 'Apex Home Solutions' }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="bg-light">
      {/* 1. HERO SECTION */}
      <section className="hero-gradient">
        <div className="container py-4 py-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-primary bg-opacity-25 border border-primary border-opacity-50 text-white rounded-pill px-3 py-2 fw-semibold mb-3">
                <i className="bi bi-patch-check-fill text-warning me-1"></i> Verified & Background-Checked Pros
              </span>
              <h1 className="display-4 fw-extrabold text-white mb-3 tracking-tight">
                Quality Home Services, <br />
                <span className="text-primary-light text-warning">Delivered to Your Door.</span>
              </h1>
              <p className="lead text-light text-opacity-75 mb-4 pe-lg-4" style={{ fontSize: '1.15rem' }}>
                Book certified electricians, plumbers, AC specialists, and cleaning crews in seconds.
                Transparent pricing, atomic slot reservations, and live technician GPS tracking.
              </p>

              {/* Search Box */}
              <form onSubmit={handleSearch} className="hero-search-box mb-4">
                <div className="row g-2 align-items-center">
                  <div className="col-md-8">
                    <div className="input-group input-group-lg border-0">
                      <span className="input-group-text bg-transparent border-0 text-muted ps-3">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 shadow-none ps-2"
                        placeholder="What service do you need? (e.g. AC Repair, Plumber, Cleaning)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold rounded-3 py-2">
                      Search Services
                    </button>
                  </div>
                </div>
              </form>

              {/* Quick Category Chips */}
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="text-white-50 small fw-medium">Popular:</span>
                {['AC Jet Servicing', 'Plumber', 'Wiring Repair', 'Deep Cleaning'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => navigate(`/services?search=${encodeURIComponent(chip)}`)}
                    className="btn btn-sm btn-outline-light rounded-pill px-3 py-1 small"
                    style={{ borderColor: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="col-lg-5 d-none d-lg-block">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80"
                  alt="Professional Home Service"
                  className="img-fluid rounded-4 shadow-lg border border-white border-opacity-25"
                  style={{ maxHeight: '440px', width: '100%', objectFit: 'cover' }}
                />
                {/* Floating Metric Card */}
                <div
                  className="position-absolute bottom-0 start-0 m-3 p-3 bg-white text-dark rounded-3 shadow-lg border animate-fade-in"
                  style={{ maxWidth: '240px' }}
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <div className="rounded-circle bg-success text-white p-1 px-2 small">
                      <i className="bi bi-check-lg"></i>
                    </div>
                    <span className="fw-bold small">Technician Arrived</span>
                  </div>
                  <div className="text-muted small">Rahul S. reached customer location with complete toolset.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-white border-bottom py-3 py-lg-4">
        <div className="container">
          <div className="row text-center g-3">
            <div className="col-6 col-md-3">
              <div className="fw-bold fs-3 text-dark">50,000+</div>
              <div className="text-muted small">Completed Bookings</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fw-bold fs-3 text-primary">4.9 / 5.0</div>
              <div className="text-muted small">Average Service Rating</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fw-bold fs-3 text-dark">1,200+</div>
              <div className="text-muted small">Verified Technicians</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fw-bold fs-3 text-success">100%</div>
              <div className="text-muted small">Service Satisfaction Warranty</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICE CATEGORIES */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small tracking-wider">Explore Catalog</span>
              <h2 className="fw-bold text-dark mt-1">Popular Service Categories</h2>
            </div>
            <Link to="/services" className="btn btn-outline-primary btn-sm fw-semibold rounded-pill px-3">
              View All <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          <div className="row g-3 g-md-4">
            {categories.slice(0, 8).map((cat) => (
              <div key={cat._id} className="col-6 col-md-4 col-lg-3">
                <Link
                  to={`/services?category=${cat.slug || cat._id}`}
                  className="hs-card hs-card-interactive p-3 text-center text-decoration-none d-block h-100"
                >
                  <div
                    className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '60px', height: '60px', fontSize: '1.6rem' }}
                  >
                    <i className={`bi ${cat.icon || 'bi-gear'}`}></i>
                  </div>
                  <h6 className="fw-bold text-dark mb-1">{cat.name}</h6>
                  <span className="text-muted small">
                    {cat.servicesCount || 5}+ Services available
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. POPULAR SERVICES SHOWCASE */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small tracking-wider">Top Rated</span>
              <h2 className="fw-bold text-dark mt-1">Trending Home Services</h2>
            </div>
            <Link to="/services" className="btn btn-link text-primary fw-semibold text-decoration-none">
              Explore All 30+ Services &rarr;
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading popular services..." />
          ) : (
            <div className="row g-4">
              {popularServices.map((service) => (
                <div key={service._id} className="col-md-6 col-lg-4">
                  <div className="hs-card hs-card-interactive h-100 d-flex flex-column overflow-hidden">
                    <div className="position-relative">
                      <img
                        src={service.coverImage}
                        alt={service.title}
                        className="w-100"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <span className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 rounded-pill px-3 py-1 small">
                        <i className="bi bi-clock me-1"></i> {service.durationMinutes} mins
                      </span>
                    </div>

                    <div className="p-4 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-light text-secondary border small">
                          {service.provider?.businessName || 'Verified Provider'}
                        </span>
                        <StarRating rating={service.rating || 4.8} />
                      </div>

                      <h6 className="fw-bold text-dark mb-2 line-clamp-2" style={{ minHeight: '44px' }}>
                        {service.title}
                      </h6>

                      <p className="text-muted small mb-4 flex-grow-1">
                        Professional doorstep service with genuine tools and post-inspection verification.
                      </p>

                      <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                        <div>
                          <span className="text-muted small d-block">Starting from</span>
                          <span className="fw-bold fs-5 text-dark">
                            ₹{service.discountPrice > 0 ? service.discountPrice : service.price}
                          </span>
                          {service.discountPrice > 0 && (
                            <span className="text-muted text-decoration-line-through small ms-2">
                              ₹{service.price}
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/services/${service._id}`}
                          className="btn btn-primary btn-sm rounded-pill px-3 py-2 fw-semibold"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-5" id="how-it-works">
        <div className="container py-3">
          <div className="text-center max-w-xl mx-auto mb-5">
            <span className="text-primary fw-bold text-uppercase small tracking-wider">Hassle-Free Experience</span>
            <h2 className="fw-bold text-dark mt-1">How HomeServe Works</h2>
            <p className="text-muted">Fast, reliable, and secure booking in 3 simple steps</p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="hs-card p-4 h-100">
                <div
                  className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3 shadow"
                  style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}
                >
                  <i className="bi bi-calendar2-check"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">1. Choose Service & Slot</h5>
                <p className="text-muted small mb-0">
                  Select your required service, pick a convenient 2-hour arrival slot, and upload any problem photos.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="hs-card p-4 h-100">
                <div
                  className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3 shadow"
                  style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}
                >
                  <i className="bi bi-truck"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">2. Verified Pro Dispatched</h5>
                <p className="text-muted small mb-0">
                  A certified technician accepts your job, arrives at your doorstep on time, and completes the service.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="hs-card p-4 h-100">
                <div
                  className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3 shadow"
                  style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}
                >
                  <i className="bi bi-shield-check"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">3. Inspect & Pay Securely</h5>
                <p className="text-muted small mb-0">
                  Inspect the completed job, review the before/after remarks, pay via Razorpay or Cash, and rate your pro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROMOTIONAL OFFER BANNER */}
      <section className="py-4">
        <div className="container">
          <div
            className="rounded-4 p-4 p-lg-5 text-white position-relative overflow-hidden shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <span className="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill mb-2">
                  LIMITED TIME OFFER
                </span>
                <h3 className="fw-extrabold mb-2">Get ₹100 Flat OFF on Your Next Service!</h3>
                <p className="text-white-50 mb-0">
                  Use promotional code <strong className="text-warning">FESTIVE100</strong> at checkout on bookings above ₹799.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                <Link to="/services" className="btn btn-warning text-dark fw-bold rounded-pill px-4 py-2">
                  Book with Promo &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
