/*
 * App.jsx — Root application component.
 *
 * Wraps the entire application in AuthProvider and BrowserRouter, then declares
 * all client-side routes including public pages, protected dashboard routes for
 * both builder and investor roles, the onboarding flow, and the dealroom.
 * Also conditionally renders the Footer, hiding it on dashboard, dealroom,
 * auth, and onboarding pages.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';

// Layout
import Navbar          from './components/layout/Navbar';
import Footer          from './components/layout/Footer';
import DashboardLayout from './components/dashboard/DashboardLayout';
import ProtectedRoute  from './components/auth/ProtectedRoute';

// Auth pages
import Login    from './pages/Login';
import Register from './pages/Register';

// Onboarding flow (post-auth, pre-dashboard)
import Onboarding     from './pages/Onboarding';
import OnboardingChat from './pages/OnboardingChat';

// Profile
import Profile from './pages/Profile';

// Public pages
import Home          from './pages/Home';
import Builders      from './pages/Builders';
import Investors     from './pages/Investors';
import Projects      from './pages/Projects';
import Dealroom      from './pages/Dealroom';
import ProjectDetail from './pages/ProjectDetail';

// Dashboard pages
import BuilderDashboard   from './pages/dashboard/BuilderDashboard';
import InvestorDashboard  from './pages/dashboard/InvestorDashboard';
import MyProjects         from './pages/dashboard/MyProjects';
import InvestorMatches    from './pages/dashboard/InvestorMatches';
import MyInvestments      from './pages/dashboard/MyInvestments';
import BuilderMatches     from './pages/dashboard/BuilderMatches';
import BuildersFeed       from './pages/dashboard/BuildersFeed';
import DashboardAnalytics from './pages/dashboard/DashboardAnalytics';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
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
              <Route
                path="/onboarding/chat"
                element={
                  <ProtectedRoute requireOnboarding={false}>
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

              {/* ── Profile ───────────────────────────────────── */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* ── Public pages ───────────────────────────────── */}
              <Route path="/"          element={<Home />} />
              <Route path="/builders"  element={<Builders />} />
              <Route path="/investors" element={<Investors />} />
              <Route path="/projects"  element={<Projects />} />
              <Route path="/dealroom"  element={<Dealroom />} />

              {/* ── Real project detail (protected — auth + onboarding) ── */}
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />

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
                <Route path="matches"    element={<InvestorMatches />} />
                <Route path="analytics"  element={<DashboardAnalytics />} />
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
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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
            <Route path="/profile"              element={null} />
            <Route path="*"                     element={<Footer />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
