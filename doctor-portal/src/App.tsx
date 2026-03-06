import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { AppLayout } from './components/Layout/AppLayout';
import { LoadingPage } from './components/Layout/LoadingPage';

/* ---- Lazy-loaded pages for code splitting ---- */
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const PatientListPage = lazy(() =>
  import('./pages/PatientListPage').then((m) => ({ default: m.PatientListPage }))
);
const PatientPage = lazy(() =>
  import('./pages/PatientPage').then((m) => ({ default: m.PatientPage }))
);
const PatientSearchPage = lazy(() =>
  import('./pages/PatientSearchPage').then((m) => ({ default: m.PatientSearchPage }))
);
const MessagesPage = lazy(() =>
  import('./pages/MessagesPage').then((m) => ({ default: m.MessagesPage }))
);
const EmergencyAlertsPage = lazy(() =>
  import('./pages/EmergencyAlertsPage').then((m) => ({ default: m.EmergencyAlertsPage }))
);
const ConnectionsPage = lazy(() =>
  import('./pages/ConnectionsPage').then((m) => ({ default: m.ConnectionsPage }))
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            {/* Public (auth) routes — no navbar/footer */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected routes — wrapped in AppLayout (navbar + footer) */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/patients" element={<PatientListPage />} />
              <Route path="/patients/search" element={<PatientSearchPage />} />
              <Route path="/patients/:patientId" element={<PatientPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/emergencies" element={<EmergencyAlertsPage />} />
              <Route path="/connections" element={<ConnectionsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;