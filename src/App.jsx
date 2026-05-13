import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './config/routes';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path={ROUTES.PUBLIC.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.PUBLIC.REGISTER} element={<RegisterPage />} />
      <Route
        path={ROUTES.PRIVATE.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to={ROUTES.PUBLIC.LOGIN} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.PUBLIC.LOGIN} replace />} />
    </Routes>
  );
}

export default App;
