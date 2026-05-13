import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './config/routes';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path={ROUTES.PUBLIC.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.PUBLIC.REGISTER} element={<RegisterPage />} />

      {/* Rutas privadas — comparten Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.PRIVATE.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.PRIVATE.PROFILE} element={<ProfilePage />} />
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.PUBLIC.LOGIN} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.PUBLIC.LOGIN} replace />} />
    </Routes>
  );
}

export default App;
