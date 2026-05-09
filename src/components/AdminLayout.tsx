import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  { to: '/admin/sistemas-rol', label: 'Sistemas de rol' },
  { to: '/admin/plantillas',   label: 'Plantillas' },
  { to: '/admin/items',        label: 'Items' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Topbar */}
      <div style={{
        background: '#1a237e', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: 52,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }} onClick={() => navigate('/admin/sistemas-rol')}>
            Panel Admin
          </span>
          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  textDecoration: 'none',
                  padding: '0.3rem 0.8rem',
                  borderRadius: 4,
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 400,
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/personajes')}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '0.3rem 0.75rem', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}
          >
            ← Ver personajes
          </button>
          <button
            onClick={logout}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '0.3rem 0.75rem', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {children}
      </div>
    </div>
  );
}
