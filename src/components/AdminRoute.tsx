import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Cargando…
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;
  if (!usuario.is_admin) return <Navigate to="/personajes" replace />;

  return <Outlet />;
}
