import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingPage } from './Layout/LoadingPage';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingPage />;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};