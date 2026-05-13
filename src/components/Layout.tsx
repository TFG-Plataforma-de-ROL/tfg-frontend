import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { ROUTES } from '../config/routes';
import './Layout.css';

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  const initials = usuario?.nombre?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="layout">
      <header className="layout-header">
        <h1 className="layout-logo" onClick={() => navigate(ROUTES.PRIVATE.DASHBOARD)}>
          ⚔️ Gestor de Rol
        </h1>
        <div className="layout-actions">
          <button
            className="avatar-btn"
            onClick={() => navigate(ROUTES.PRIVATE.PROFILE)}
            title={`Perfil de ${usuario?.nombre}`}
          >
            {usuario?.avatar_url ? (
              <img src={usuario.avatar_url} alt={usuario.nombre} className="avatar-img" />
            ) : (
              initials
            )}
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
