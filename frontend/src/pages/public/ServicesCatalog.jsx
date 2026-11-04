import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ServicesCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const selectedCategory = searchParams.get('category') || '';
  const searchKeyword = searchParams.get('search') || '';
  const selectedCity = searchParams.get('city') || '';
  const selectedSort = searchParams.get('sort') || 'rating';
  const currentPage = Number(searchParams.get('page') || 1);

  // Load categories taxonomy
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.warn('Error fetching categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch filtered services
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchKeyword) params.append('search', searchKeyword);
        if (selectedCity) params.append('city', selectedCity);
        if (selectedSort) params.append('sort', selectedSort);
        params.append('page', currentPage);
        params.append('limit', 12);

        const res = await api.get(`/services?${params.toString()}`);
        if (res.success) {
          setServices(res.data);
          setTotalCount(res.pagination?.total || res.data.length);
        }
      } catch (err) {
        console.warn('Error fetching services:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, searchKeyword, selectedCity, selectedSort, currentPage]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="py-4 py-lg-5 bg-light min-vh-100">
      <div className="container">
        {/* Header Breadcrumb & Title */}
        <div className="mb-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small text-muted mb-2">
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Services Catalog</li>
            </ol>
          </nav>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h2 className="fw-bold text-dark mb-1">Explore Home Services</h2>
              <p className="text-muted small mb-0">Showing {services.length} of {totalCount} verified professional services</p>
            </div>
            {/* Sorting Dropdown */}
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">Sort:</span>
              <select
                className="form-select form-select-sm shadow-none rounded-3 border-secondary border-opacity-25"
                style={{ width: '160px' }}
                value={selectedSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
              >
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="hs-card p-3 mb-4 bg-white">
          <div className="row g-2 align-items-center">
            {/* Search Input */}
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 shadow-none"
                  placeholder="Search service title, keyword..."
                  value={searchKeyword}
                  onChange={(e) => updateFilter('search', e.target.value)}
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="col-md-4 col-6">
              <select
                className="form-select bg-light shadow-none"
                value={selectedCategory}
                onChange={(e) => updateFilter('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug || cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div className="col-md-3 col-6">
              <select
                className="form-select bg-light shadow-none"
                value={selectedCity}
                onChange={(e) => updateFilter('city', e.target.value)}
              >
                <option value="">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Navi Mumbai">Navi Mumbai</option>
                <option value="Thane">Thane</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(selectedCategory || searchKeyword || selectedCity) && (
            <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-3 border-top">
              <span className="small text-muted fw-semibold">Active Filters:</span>
              {searchKeyword && (
                <span className="badge bg-light text-dark border d-flex align-items-center gap-1 py-1 px-2">
                  Keyword: "{searchKeyword}"
                  <i className="bi bi-x cursor-pointer" onClick={() => updateFilter('search', '')}></i>
                </span>
              )}
              {selectedCategory && (
                <span className="badge bg-light text-dark border d-flex align-items-center gap-1 py-1 px-2">
                  Category: {selectedCategory}
                  <i className="bi bi-x cursor-pointer" onClick={() => updateFilter('category', '')}></i>
                </span>
              )}
              {selectedCity && (
                <span className="badge bg-light text-dark border d-flex align-items-center gap-1 py-1 px-2">
                  City: {selectedCity}
                  <i className="bi bi-x cursor-pointer" onClick={() => updateFilter('city', '')}></i>
                </span>
              )}
              <button
                className="btn btn-link btn-sm text-danger text-decoration-none p-0 ms-auto"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <LoadingSpinner message="Searching available services..." />
        ) : services.length === 0 ? (
          <EmptyState
            icon="bi-search"
            title="No matching services found"
            message="Try adjusting your search keywords, clearing selected category filters, or choosing a different city."
            actionText="Reset All Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <div className="row g-4">
            {services.map((service) => (
              <div key={service._id} className="col-md-6 col-lg-4">
                <div className="hs-card hs-card-interactive h-100 d-flex flex-column overflow-hidden">
                  <div className="position-relative">
                    <img
                      src={service.coverImage}
                      alt={service.title}
                      className="w-100"
                      style={{ height: '210px', objectFit: 'cover' }}
                    />
                    <span className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 rounded-pill px-3 py-1 small">
                      <i className="bi bi-clock me-1"></i> {service.durationMinutes} mins
                    </span>
                    {service.discountPrice > 0 && (
                      <span className="position-absolute top-0 start-0 m-2 badge bg-danger rounded-pill px-2 py-1 small fw-bold">
                        SAVE ₹{service.price - service.discountPrice}
                      </span>
                    )}
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

                    <p className="text-muted small mb-3 flex-grow-1" style={{ fontSize: '0.85rem' }}>
                      {service.description.slice(0, 110)}...
                    </p>

                    {/* Included Features Bullet Points */}
                    {service.includedFeatures && service.includedFeatures.length > 0 && (
                      <div className="mb-3">
                        <ul className="list-unstyled mb-0" style={{ fontSize: '0.78rem' }}>
                          {service.includedFeatures.slice(0, 2).map((feat, idx) => (
                            <li key={idx} className="text-secondary d-flex align-items-center gap-1 mb-1">
                              <i className="bi bi-check-circle-fill text-success"></i>
                              <span className="text-truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                      <div>
                        <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>Standard Rate</span>
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
                        View & Book
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesCatalog;
