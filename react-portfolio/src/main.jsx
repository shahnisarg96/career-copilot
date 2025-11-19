import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUserView from './pages/AdminUserView.jsx';
import Landing from './pages/Landing.jsx';
import PortfolioViewer from './pages/PortfolioViewer.jsx';
import PublicPortfolio from './pages/PublicPortfolio.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/portfolio" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio/preview"
            element={
              <ProtectedRoute>
                <PortfolioViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio/:userId"
            element={<PortfolioViewer />}
          />
          
          {/* Public Portfolio by Slug */}
          <Route
            path="/p/:slug"
            element={<PublicPortfolio />}
          />
          
          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user/:userId"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUserView />
              </ProtectedRoute>
            }
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
);
