/*
 * App.jsx — Root application component.
 *
 * Wraps the entire application in AuthProvider and BrowserRouter, then declares
 * all client-side routes including public pages, protected dashboard routes for
 * both builder and investor roles, the onboarding flow, and the dealroom.
 * Also conditionally renders the Footer, hiding it on dashboard, dealroom,
 * auth, and onboarding pages.
 */
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import { useLayoutEffect, lazy, Suspense } from 'react';
import { Toaster }         from 'sonner';

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Shown while a lazy route chunk loads — minimal, no extra imports.
function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading">
      <div className="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
    </div>
  );
}

// Eager shell — navbar/footer render on (almost) every route; the guard is tiny
// and used everywhere, so keep these in the initial bundle.
import Navbar         from './components/layout/Navbar';
import Footer         from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Route-level code splitting: each page (and the dashboard shell) is its own
// chunk loaded on demand, so the first paint of "/" or "/login" no longer
// downloads the dashboards, charts (recharts), or Leaflet.
const DashboardLayout    = lazy(() => import('./components/dashboard/DashboardLayout'));
const Login              = lazy(() => import('./pages/Login'));
const Register           = lazy(() => import('./pages/Register'));
const Onboarding         = lazy(() => import('./pages/Onboarding'));
const OnboardingChat     = lazy(() => import('./pages/OnboardingChat'));
const OnboardingVerification = lazy(() => import('./pages/OnboardingVerification'));
const Profile            = lazy(() => import('./pages/Profile'));
const Home               = lazy(() => import('./pages/Home'));
const Builders           = lazy(() => import('./pages/Builders'));
const BuilderDetail      = lazy(() => import('./pages/BuilderDetail'));
const Projects           = lazy(() => import('./pages/Projects'));
const Dealroom           = lazy(() => import('./pages/Dealroom'));
const ProjectDetail      = lazy(() => import('./pages/ProjectDetail'));
const QuotePage          = lazy(() => import('./pages/QuotePage'));
const QuoteResponsePage  = lazy(() => import('./pages/QuoteResponsePage'));
const StyleGuide         = lazy(() => import('./pages/StyleGuide'));
const BuilderDashboard   = lazy(() => import('./pages/dashboard/BuilderDashboard'));
const InvestorDashboard  = lazy(() => import('./pages/dashboard/InvestorDashboard'));
const MyProjects         = lazy(() => import('./pages/dashboard/MyProjects'));
const BuilderQuotes      = lazy(() => import('./pages/dashboard/BuilderQuotes'));
const InvestorMatches    = lazy(() => import('./pages/dashboard/InvestorMatches'));
const MyInvestments      = lazy(() => import('./pages/dashboard/MyInvestments'));
const BuilderMatches     = lazy(() => import('./pages/dashboard/BuilderMatches'));
const BuildersFeed       = lazy(() => import('./pages/dashboard/BuildersFeed'));
const DashboardAnalytics = lazy(() => import('./pages/dashboard/DashboardAnalytics'));

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#fff',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
            fontSize: '0.875rem',
          },
          classNames: {
            success: 'border border-emerald-200 bg-emerald-50',
            error:   'border border-red-200 bg-red-50',
          },
        }}
      />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          {/* Hide navbar on full-screen auth pages */}
          <Routes>
            <Route path="/login"    element={null} />
            <Route path="/register" element={null} />
            <Route path="*"         element={<Navbar />} />
          </Routes>
          <main className="flex-1">
            <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* ── Auth pages ─────────────────────────────────── */}
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ── Onboarding flow (auth required, onboarding NOT yet required) ── */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute requireOnboarding={false}>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              {/* allowRetake on /onboarding/chat: completeOnboarding() flips the flag
                  while the chat is still mounted; without it the guard's dashboard
                  redirect races (and beats) the chat's navigate to /onboarding/verification. */}
              <Route
                path="/onboarding/chat"
                element={
                  <ProtectedRoute requireOnboarding={false} allowRetake={true}>
                    <OnboardingChat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding/retake"
                element={
                  <ProtectedRoute requireOnboarding={false} allowRetake={true}>
                    <OnboardingChat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding/verification"
                element={
                  <ProtectedRoute requireOnboarding={false} allowRetake={true}>
                    <OnboardingVerification />
                  </ProtectedRoute>
                }
              />

              {/* ── Profile (uses DashboardLayout for sidebar) ── */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Profile />} />
              </Route>

              {/* ── Public pages ───────────────────────────────── */}
              <Route path="/"            element={<Home />} />
              <Route path="/styleguide"  element={<StyleGuide />} />
              {/* Builders & Projects require auth — redirect to login, then back */}
              <Route path="/builders"     element={<ProtectedRoute><Builders /></ProtectedRoute>} />
              <Route path="/builders/:id" element={<ProtectedRoute><BuilderDetail /></ProtectedRoute>} />
              <Route path="/projects"     element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/dealroom"  element={<Navigate to="/dashboard/dealroom" replace />} />

              {/* ── Real project detail (protected — auth + onboarding) ── */}
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />

              {/* ── Quote pages (public — accessible via email links) ── */}
              <Route path="/quote/:id"                element={<QuotePage />} />
              <Route path="/quote-response/:token"    element={<QuoteResponsePage />} />

              {/* ── Builder dashboard (protected + onboarding required) ── */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index             element={<BuilderDashboard />} />
                <Route path="projects"   element={<MyProjects />} />
                <Route path="quote-requests" element={<BuilderQuotes />} />
                <Route path="matches"    element={<InvestorMatches />} />
                <Route path="analytics"  element={<DashboardAnalytics />} />
                <Route path="dealroom"   element={<Dealroom />} />
              </Route>

              {/* ── Investor dashboard (protected + onboarding required) ── */}
              <Route
                path="/investor-dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index                  element={<InvestorDashboard />} />
                <Route path="investments"     element={<MyInvestments />} />
                <Route path="matches"         element={<BuilderMatches />} />
                <Route path="feed"            element={<BuildersFeed />} />
                <Route path="analytics"       element={<DashboardAnalytics />} />
                <Route path="dealroom"        element={<Dealroom />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </main>

          {/* Footer hidden on dashboard, dealroom, auth, and onboarding pages */}
          <Routes>
            <Route path="/dashboard/*"          element={null} />
            <Route path="/investor-dashboard/*" element={null} />
            <Route path="/dealroom"             element={null} />
            <Route path="/login"                element={null} />
            <Route path="/register"             element={null} />
            <Route path="/onboarding"           element={null} />
            <Route path="/onboarding/chat"      element={null} />
            <Route path="/onboarding/retake"    element={null} />
            <Route path="/onboarding/verification" element={null} />
            <Route path="/profile"              element={null} />
            <Route path="/quote-response/*"     element={null} />
            <Route path="*"                     element={<Footer />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
