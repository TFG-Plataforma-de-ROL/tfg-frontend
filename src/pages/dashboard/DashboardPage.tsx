import { useAuth } from '../../hooks';
import { ROUTES } from '../../config/routes';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0c29', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#c9a84c', margin: 0 }}>⚔️ Gestor de Rol</h1>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.7)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Bienvenido, <strong style={{ color: '#c9a84c' }}>{usuario?.nombre}</strong>. El dashboard está en construcción.
        </p>
      </div>
    </div>
  );
}
