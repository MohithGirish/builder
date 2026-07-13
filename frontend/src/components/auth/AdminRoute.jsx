/*
 * AdminRoute.jsx — Route guard for admin-only pages.
 *
 * Modelled on ProtectedRoute but fail-closed on role: while the session is
 * loading it shows the same spinner; unauthenticated users go to /login
 * (preserving the intended path); any authenticated non-admin is bounced to the
 * home page. No onboarding check — admins never run onboarding.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-9 h-9 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#2b5e93', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
