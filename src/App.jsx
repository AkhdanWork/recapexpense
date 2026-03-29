// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// App pages
import DashboardPage from './pages/dashboard/DashboardPage';
import TransactionListPage from './pages/transactions/TransactionListPage';
import TransactionFormPage from './pages/transactions/TransactionFormPage';
import ReportsPage from './pages/reports/ReportsPage';
import CategoriesPage from './pages/categories/CategoriesPage';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Layout>
                  <TransactionListPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions/new"
            element={
              <PrivateRoute>
                <Layout>
                  <TransactionFormPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions/:id/edit"
            element={
              <PrivateRoute>
                <Layout>
                  <TransactionFormPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Layout>
                  <ReportsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <Layout>
                  <CategoriesPage />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1D27',
              color: '#F1F5F9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#1A1D27' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#1A1D27' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
