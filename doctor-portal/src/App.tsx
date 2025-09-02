import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientPage } from './pages/PatientPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - redirect to dashboard if authenticated */}
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

          {/* Protected Routes - require authentication */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId" 
            element={
              <ProtectedRoute>
                <PatientPage />
              </ProtectedRoute>
            } 
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
