import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ScanPage from './pages/ScanPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import GuidePage from './pages/GuidePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import AuthLayout from './pages/auth/AuthLayout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './pages/LandingPage.jsx';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "123456789.apps.googleusercontent.com"; // Provide a fallback for build
  return (
    <GoogleOAuthProvider clientId={clientId}>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="scan" element={<ScanPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="guide" element={<GuidePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
