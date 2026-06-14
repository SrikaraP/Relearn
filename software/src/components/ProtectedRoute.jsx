import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their specific dashboard if they try to access wrong role dashboard
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
