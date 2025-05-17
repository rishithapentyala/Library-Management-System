import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Routes
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';

// User Routes
import UserDashboard from './pages/user/Dashboard';
import BookDetails from './pages/user/BookDetails';
import BorrowedBooks from './pages/user/BorrowedBooks';

// Admin Routes
import AdminDashboard from './pages/admin/Dashboard';
import ManageBooks from './pages/admin/ManageBooks';
import ViewUsers from './pages/admin/ViewUsers';
import ApproveRequests from './pages/admin/ApproveRequests';
import TrackReturns from './pages/admin/TrackReturns';

// Context
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* User Routes */}
          <Route path="/user" element={<ProtectedRoute role="user" />}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="book/:id" element={<BookDetails />} />
            <Route path="borrowed" element={<BorrowedBooks />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="books" element={<ManageBooks />} />
            <Route path="users" element={<ViewUsers />} />
            <Route path="requests" element={<ApproveRequests />} />
            <Route path="returns" element={<TrackReturns />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;