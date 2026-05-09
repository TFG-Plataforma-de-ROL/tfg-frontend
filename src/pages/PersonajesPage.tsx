import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { personajeService } from '../services/personajeService';
import type { Personaje } from '../types';

const s = {
  page: { maxWidth: 800, margin: '0 auto', padding: '2rem' } as const,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' } as const,
  btnPrimary: { padding: '0.5rem 1.25rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.95rem' } as const,
  btnDanger: { padding: '0.25rem 0.75rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem' } as const,
  btnSecondary: { padding: '0.25rem 0.75rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem' } as const,
  btnLogout: { padding: '0.5rem 1rem', background: 'transparent', color: '#666', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: '0.875rem' } as const,
  card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as const,
  cardInfo: { flex: 1 } as const,
  cardName: { fontWeight: 700, fontSize: '1.05rem', marginBottom: 2 } as const,
  cardSub: { fontSize: '0.85rem', color: '#666' } as const,
  actions: { display: 'flex', gap: '0.5rem' } as const,
  empty: { textAlign: 'center' as const, color: '#888', padding: '3rem', background: '#fafafa', borderRadius: 8, border: '1px dashed #ddd' },
  err: { background: '#fde8e8', color: '#c62828', borderRadius: 4, padding: '0.75rem', marginBottom: '1rem' } as const,
};

export default function PersonajesPage() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    personajeService.getAll()
      .then(setPersonajes)
      .catch(() => setError('Error al cargar personajes.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este personaje?')) return;
    try {
      await personajeService.delete(id);
      setPersonajes(prev => prev.filter(p => p.id_personaje !== id));
    } catch {
      setError('Error al eliminar el personaje.');
    }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={{ margin: 0 }}>Mis Personajes</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.875rem' }}>Bienvenido, {usuario?.nombre}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button style={s.btnPrimary} onClick={() => navigate('/personajes/nuevo')}>
            + Nuevo personaje
          </button>
          {usuario?.is_admin && (
            <button style={{ ...s.btnLogout, color: '#1a237e', borderColor: '#1a237e' }} onClick={() => navigate('/admin')}>
              Panel Admin
            </button>
          )}
          <button style={s.btnLogout} onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      {error && <div style={s.err}>{error}</div>}

      {loading ? (
        <p>Cargando…</p>
      ) : personajes.length === 0 ? (
        <div style={s.empty}>
          <p style={{ margin: 0, fontWeight: 600 }}>Aún no tienes personajes</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Crea uno eligiendo un sistema de rol</p>
        </div>
      ) : (
        personajes.map(p => (
          <div key={p.id_personaje} style={s.card}>
            <div style={s.cardInfo}>
              <div style={s.cardName}>{p.nombre}</div>
              <div style={s.cardSub}>{p.sistema_rol?.nombre ?? 'Sistema desconocido'}</div>
            </div>
            <div style={s.actions}>
              <button style={s.btnSecondary} onClick={() => navigate(`/personajes/${p.id_personaje}/builder`)}>
                Abrir builder
              </button>
              <button style={s.btnDanger} onClick={() => handleDelete(p.id_personaje)}>
                Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
