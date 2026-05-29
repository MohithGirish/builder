/*
 * ProtectedRoute.jsx — Route guard component for authenticated and onboarded routes.
 *
 * Redirects unauthenticated users to /login (preserving the intended path in
 * router state). When requireOnboarding is true (default), also redirects to
 * /onboarding if the user has not completed the onboarding flow, storing the
 * intended path in sessionStorage for post-onboarding redirect. When
 * requireOnboarding is false, redirects already-onboarded users to their
 * dashboard unless allowRetake is set (retake flow).
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * requireOnboarding (default true):
 *   true  → also checks onboardingComplete; redirects to /onboarding if not done
 *   false → only checks authentication; also redirects away if onboarding already done
 */
export default function ProtectedRoute({ children, requireOnboarding = true, allowRetake = false }) {
  const { isAuthenticated, isLoading, onboardingComplete, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-9 h-9 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#0d9488', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Onboarding pages: redirect away if user already completed onboarding (unless retake)
  if (!requireOnboarding && onboardingComplete && !allowRetake) {
    const dest = role === 'investor' ? '/investor-dashboard' : '/dashboard';
    return <Navigate to={dest} replace />;
  }

  // Dashboard pages: redirect to onboarding if not yet completed
  if (requireOnboarding && !onboardingComplete) {
    // Preserve the intended destination so onboarding can redirect there afterward
    const dest = location.pathname + location.search;
    if (dest && dest !== '/onboarding' && dest !== '/') {
      sessionStorage.setItem('builderai_redirect', dest);
    }
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
