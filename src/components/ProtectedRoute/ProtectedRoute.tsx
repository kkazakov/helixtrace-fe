import { Navigate } from 'react-router-dom';
import { getStoredAuth } from '../../services/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = getStoredAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
