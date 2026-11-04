import axios from 'axios';
import { MOCK_CATEGORIES, MOCK_SERVICES, MOCK_USERS } from './mockData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper: Handle mock responses when running standalone/offline
const handleMockFallback = (url, method, requestData) => {
  const cleanUrl = url.split('?')[0];

  // 1. Categories
  if (cleanUrl.endsWith('/categories')) {
    return { success: true, data: MOCK_CATEGORIES };
  }

  // 2. Services List & Query
  if (cleanUrl.endsWith('/services')) {
    const params = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
    const category = params.get('category');
    const search = params.get('search');
    const sort = params.get('sort');
    const limit = Number(params.get('limit')) || 12;

    let results = [...MOCK_SERVICES];

    if (category) {
      results = results.filter(
        (s) => s.category.slug === category || s.category._id === category
      );
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.name.toLowerCase().includes(q)
      );
    }

    if (sort === 'price_asc') results.sort((a, b) => a.discountPrice - b.discountPrice);
    if (sort === 'price_desc') results.sort((a, b) => b.discountPrice - a.discountPrice);
    if (sort === 'rating') results.sort((a, b) => b.rating - a.rating);

    const paginated = results.slice(0, limit);
    return {
      success: true,
      data: paginated,
      pagination: { total: results.length, page: 1, limit, pages: Math.ceil(results.length / limit) }
    };
  }

  // 3. Single Service Detail
  if (cleanUrl.includes('/services/')) {
    const id = cleanUrl.split('/services/')[1];
    const found = MOCK_SERVICES.find((s) => s._id === id || s.slug === id) || MOCK_SERVICES[0];
    return { success: true, data: found };
  }

  // 4. Authentication Login
  if (cleanUrl.endsWith('/auth/login') && method === 'post') {
    let email = '';
    let password = '';
    try {
      const parsed = typeof requestData === 'string' ? JSON.parse(requestData) : requestData;
      email = parsed?.email || '';
      password = parsed?.password || '';
    } catch {
      // ignore
    }

    const mockAccount = MOCK_USERS[email];
    if (mockAccount) {
      return {
        success: true,
        message: 'Login successful',
        data: {
          token: mockAccount.token,
          user: mockAccount.user,
          profile: { businessName: mockAccount.user.firstName + ' Services' }
        }
      };
    }

    // Default fallback customer account if unregistered email
    return {
      success: true,
      message: 'Logged in successfully',
      data: {
        token: 'demo-jwt-generic-token',
        user: { _id: 'u-temp', email, role: 'customer', firstName: email.split('@')[0], lastName: 'User', phone: '+91 9825100099' }
      }
    };
  }

  // 5. Auth Me
  if (cleanUrl.endsWith('/auth/me')) {
    const storedUser = localStorage.getItem('homeserve_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        return { success: true, data: { user: u, profile: {} } };
      } catch {
        // ignore
      }
    }
    return { success: true, data: { user: MOCK_USERS['admin@homeserve.com'].user, profile: {} } };
  }

  // 6. Admin Analytics
  if (cleanUrl.includes('/admin/')) {
    return {
      success: true,
      data: {
        totalBookings: 105,
        totalRevenue: 284500,
        totalCommissions: 42675,
        totalCustomers: 20,
        totalProviders: 15,
        activeTechnicians: 25,
        pendingApprovals: 3
      }
    };
  }

  // 7. Provider Stats
  if (cleanUrl.includes('/provider') || cleanUrl.includes('/providers')) {
    return {
      success: true,
      data: {
        totalEarnings: 84500,
        completedJobs: 46,
        pendingRequests: 4,
        averageRating: 4.8
      }
    };
  }

  // 8. Bookings
  if (cleanUrl.includes('/bookings')) {
    return {
      success: true,
      data: [
        {
          _id: 'b-101',
          bookingReference: 'HSB-20261104-Y82CS',
          service: MOCK_SERVICES[0],
          status: 'completed',
          bookingDate: new Date().toISOString(),
          timeSlot: '10:00 - 12:00',
          pricing: { totalAmount: 249 },
          serviceAddress: { streetAddress: '401 Titanium Square', city: 'Ahmedabad' }
        },
        {
          _id: 'b-102',
          bookingReference: 'HSB-20261104-XWU2W',
          service: MOCK_SERVICES[10],
          status: 'in_progress',
          bookingDate: new Date().toISOString(),
          timeSlot: '14:00 - 16:00',
          pricing: { totalAmount: 499 },
          serviceAddress: { streetAddress: '12 Shrinath Apartment', city: 'Ahmedabad' }
        }
      ],
      pagination: { total: 2, page: 1, limit: 10, pages: 1 }
    };
  }

  return { success: true, data: [] };
};

// Request Interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('homeserve_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format responses and seamlessly handle offline / fallback data
api.interceptors.response.use(
  (response) => {
    // If Netlify served HTML (SPA index.html) instead of API JSON, fallback to mock data
    if (
      typeof response.data === 'string' &&
      (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html'))
    ) {
      return handleMockFallback(response.config.url || '', response.config.method || 'get', response.config.data);
    }
    return response.data;
  },
  (error) => {
    // If backend is offline or network error, resolve with mock data gracefully
    if (
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.response.status === 404 ||
      error.response.status === 502
    ) {
      const mockResult = handleMockFallback(
        error.config?.url || '',
        error.config?.method || 'get',
        error.config?.data
      );
      if (mockResult) return Promise.resolve(mockResult);
    }

    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('homeserve_token')) {
        localStorage.removeItem('homeserve_token');
        localStorage.removeItem('homeserve_user');
      }
    }
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
