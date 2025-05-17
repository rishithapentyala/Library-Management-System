import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  role: 'user' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} />;
  }
  
  if (userRole !== role) {
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard'} />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;