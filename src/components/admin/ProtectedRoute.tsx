import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // TODO: Premium loading state
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
