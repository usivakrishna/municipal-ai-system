import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CitizenDashboardPage = lazy(() => import('./pages/CitizenDashboardPage'));
const SubmitComplaintPage = lazy(() => import('./pages/SubmitComplaintPage'));
const MyComplaintsPage = lazy(() => import('./pages/MyComplaintsPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const ComplaintListPage = lazy(() => import('./pages/ComplaintListPage'));
const DelayedComplaintsPage = lazy(() => import('./pages/DelayedComplaintsPage'));
const AnalyticsDashboardPage = lazy(() => import('./pages/AnalyticsDashboardPage'));
const ClusteredIssuesPage = lazy(() => import('./pages/ClusteredIssuesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const App = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4 text-sm font-semibold text-brand-700">
          Loading interface...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/citizen"
          element={
            <ProtectedRoute roles={['citizen', 'admin']}>
              <DashboardLayout mode="citizen" />
            </ProtectedRoute>
          }
        >
          <Route index element={<CitizenDashboardPage />} />
          <Route path="submit" element={<SubmitComplaintPage />} />
          <Route path="complaints" element={<MyComplaintsPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout mode="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="complaints" element={<ComplaintListPage />} />
          <Route path="delayed" element={<DelayedComplaintsPage />} />
          <Route path="analytics" element={<AnalyticsDashboardPage />} />
          <Route path="clusters" element={<ClusteredIssuesPage />} />
        </Route>

        <Route path="/dashboard" element={<Navigate to="/citizen" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
