import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Module 1 Pages
import HomePage from '../pages/home/HomePage';
import DiscoveryPage from '../pages/home/DiscoveryPage';

// Module 2 Pages
import BookListingPage from '../pages/books/BookListingPage';
import BookDetailPage from '../pages/books/BookDetailPage';
import AddBookPage from '../pages/books/AddBookPage';

// Module 3 Pages
import ExchangeHubPage from '../pages/exchange/ExchangeHubPage';
import MyRequestsPage from '../pages/exchange/MyRequestsPage';

// Module 4 Pages
import UserDashboardPage from '../pages/dashboard/UserDashboardPage';
import MyListingsPage from '../pages/dashboard/MyListingsPage';
import MyBorrowedBooksPage from '../pages/dashboard/MyBorrowedBooksPage';
import MyLentBooksPage from '../pages/dashboard/MyLentBooksPage';
import ProfilePage from '../pages/profile/ProfilePage';
import EditProfilePage from '../pages/profile/EditProfilePage';
import TransactionHistoryPage from '../pages/dashboard/TransactionHistoryPage';

// Module 5 Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import NotificationsPage from '../pages/admin/NotificationsPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// 404
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Module 1: Home & Discovery */}
        <Route index element={<HomePage />} />
        <Route path="discover" element={<DiscoveryPage />} />

        {/* Module 2: Book Listing & Details */}
        <Route path="books" element={<BookListingPage />} />
        <Route path="books/:id" element={<BookDetailPage />} />

        <Route
          path="books/add"
          element={
            <ProtectedRoute>
              <AddBookPage />
            </ProtectedRoute>
          }
        />

        {/* Module 3: Borrow / Lend / Exchange */}
        <Route path="exchange" element={<ExchangeHubPage />} />

        <Route
          path="exchange/requests"
          element={
            <ProtectedRoute>
              <MyRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* Module 4: User Account & Dashboard */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="dashboard/listings"
          element={
            <ProtectedRoute>
              <MyListingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="dashboard/borrowed"
          element={
            <ProtectedRoute>
              <MyBorrowedBooksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="dashboard/lent"
          element={
            <ProtectedRoute>
              <MyLentBooksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/transactions"
          element={
            <ProtectedRoute>
              <TransactionHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* User Profile */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Edit Profile */}
        <Route
          path="profile/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Module 5: Admin & Notifications */}
        <Route
          path="admin"
          element={
            <ProtectedRoute requireRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;