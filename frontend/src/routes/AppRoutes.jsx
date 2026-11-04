import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Home from '../pages/public/Home';
import ServicesCatalog from '../pages/public/ServicesCatalog';
import ServiceDetails from '../pages/public/ServiceDetails';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import Unauthorized from '../pages/public/Unauthorized';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import MyBookings from '../pages/customer/MyBookings';
import BookingDetails from '../pages/customer/BookingDetails';
import CustomerAddresses from '../pages/customer/CustomerAddresses';
import CustomerComplaints from '../pages/customer/CustomerComplaints';
import CustomerProfile from '../pages/customer/CustomerProfile';

// Provider Pages
import ProviderDashboard from '../pages/provider/ProviderDashboard';
import ProviderBookings from '../pages/provider/ProviderBookings';
import ProviderServices from '../pages/provider/ProviderServices';
import ProviderAvailability from '../pages/provider/ProviderAvailability';
import ProviderTechnicians from '../pages/provider/ProviderTechnicians';
import ProviderEarnings from '../pages/provider/ProviderEarnings';
import ProviderKYC from '../pages/provider/ProviderKYC';
import ProviderReviews from '../pages/provider/ProviderReviews';

// Technician Pages
import TechnicianDashboard from '../pages/technician/TechnicianDashboard';
import TechnicianJobs from '../pages/technician/TechnicianJobs';
import TechnicianProfile from '../pages/technician/TechnicianProfile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProviders from '../pages/admin/AdminProviders';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminCommissions from '../pages/admin/AdminCommissions';
import AdminComplaints from '../pages/admin/AdminComplaints';
import AdminCoupons from '../pages/admin/AdminCoupons';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/verified-pros" element={<Navigate to="/#verified-pros" replace />} />
        <Route path="/how-it-works" element={<Navigate to="/#how-it-works" replace />} />
        <Route path="/providers" element={<Navigate to="/#verified-pros" replace />} />
        <Route path="/services" element={<ServicesCatalog />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* 2. CUSTOMER PROTECTED ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route path="/customer" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="bookings/:id" element={<BookingDetails />} />
          <Route path="addresses" element={<CustomerAddresses />} />
          <Route path="complaints" element={<CustomerComplaints />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>
      </Route>

      {/* 3. PROVIDER PROTECTED ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
        <Route path="/provider" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/provider/dashboard" replace />} />
          <Route path="dashboard" element={<ProviderDashboard />} />
          <Route path="bookings" element={<ProviderBookings />} />
          <Route path="services" element={<ProviderServices />} />
          <Route path="availability" element={<ProviderAvailability />} />
          <Route path="technicians" element={<ProviderTechnicians />} />
          <Route path="earnings" element={<ProviderEarnings />} />
          <Route path="kyc" element={<ProviderKYC />} />
          <Route path="reviews" element={<ProviderReviews />} />
        </Route>
      </Route>

      {/* 4. TECHNICIAN PROTECTED ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['technician']} />}>
        <Route path="/technician" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/technician/dashboard" replace />} />
          <Route path="dashboard" element={<TechnicianDashboard />} />
          <Route path="jobs" element={<TechnicianJobs />} />
          <Route path="profile" element={<TechnicianProfile />} />
        </Route>
      </Route>

      {/* 5. SUPER ADMIN PROTECTED ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="commissions" element={<AdminCommissions />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
