import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/CustomerList';
import { OrdersPage } from './components/OrdersPage';
import './App.css';

const Navigation = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>B2B Portal</h2>
        </div>
        <ul className="navbar-menu">
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/customers">Customers</a></li>
          <li><a href="/orders">Orders</a></li>
        </ul>
        <div className="navbar-user">
          <span className="user-info">
            {user.firstName} ({user.role})
          </span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navigation />}
      <div className={isAuthenticated ? 'app-container' : ''}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
