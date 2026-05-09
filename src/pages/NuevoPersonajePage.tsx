import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { sistemaRolService } from '../services/sistemaRolService';
import { personajeService } from '../services/personajeService';
import type { SistemaRol } from '../types';

const s = {
  page: { maxWidth: 680, margin: '0 auto', padding: '2rem' } as const,
  back: { background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', padding: 0, fontSize: '0.9rem', marginBottom: '1.5rem', display: 'block' } as const,
  title: { margin: '0 0 0.25rem', fontSize: '1.5rem' } as const,
  sub: { margin: '0 0 2rem', color: '#666', fontSize: '0.9rem' } as const,
  step: { fontSize: '0.8rem', fontWeight: 700, color: '#1976d2', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: '0.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '2rem' } as const,
  sistemCard: (selected: boolean) => ({
    border: `2px solid ${selected ? '#1976d2' : '#e0e0e0'}`,
    borderRadius: 8,
    padding: '1rem',
    cursor: 'pointer',
    background: selected ? '#e3f2fd' : '#fff',
    transition: 'border-color 0.15s',
  } as const),
  sistemName: { fontWeight: 700, marginBottom: 4 } as const,
  sistemDesc: { fontSize: '0.8rem', color: '#666' } as const,
  field: { marginBottom: '1rem' } as const,
  label: { display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 } as const,
  input: { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '1rem', boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '1rem', boxSizing: 'border-box' as const, resize: 'vertical' as const, minHeight: 72 },
  actions: { display: 'flex', gap: '0.75rem', marginTop: '1.5rem' } as const,
  btnPrimary: { padding: '0.625rem 1.5rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '1rem' } as const,
  btnSecondary: { padding: '0.625rem 1.5rem', background: 'transparent', color: '#333', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: '1rem' } as const,
  err: { background: '#fde8e8', color: '#c62828', borderRadius: 4, padding: '0.75rem', marginBottom: '1rem' } as const,
  badge: { fontSize: '0.75rem', color: '#555', marginTop: 4 } as const,
};

type Step = 'sistema' | 'nombre';

export default function NuevoPersonajePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('sistema');
  const [sistemas, setSistemas] = useState<SistemaRol[]>([]);
  const [sistemaSeleccionado, setSistemaSeleccionado] = useState<SistemaRol | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    sistemaRolService.getAll()
      .then(setSistemas)
      .catch(() => setError('Error al cargar los sistemas de rol.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!sistemaSeleccionado) return;
    setSaving(true);
    setError('');
    try {
      const personaje = await personajeService.create({
        nombre,
        descripcion: descripcion || undefined,
        id_sistema_rol: sistemaSeleccionado.id_sistema_rol,
      });
      navigate(`/personajes/${personaje.id_personaje}/builder`);
    } catch {
      setError('Error al crear el personaje.');
      setSaving(false);
    }
  }

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate('/personajes')}>← Volver</button>
      <h1 style={s.title}>Nuevo personaje</h1>

      {error && <div style={s.err}>{error}</div>}

      {step === 'sistema' && (
        <>
          <p style={s.sub}>Elige el sistema de rol</p>
          <div style={s.step}>Paso 1 de 2 — Sistema de rol</div>
          {loading ? (
            <p>Cargando sistemas…</p>
          ) : sistemas.length === 0 ? (
            <p style={{ color: '#888' }}>No hay sistemas de rol disponibles. Pide a un administrador que cree uno.</p>
          ) : (
            <div style={s.grid}>
              {sistemas.map(sis => (
                <div
                  key={sis.id_sistema_rol}
                  style={s.sistemCard(sistemaSeleccionado?.id_sistema_rol === sis.id_sistema_rol)}
                  onClick={() => setSistemaSeleccionado(sis)}
                >
                  <div style={s.sistemName}>{sis.nombre}</div>
                  {sis.descripcion && <div style={s.sistemDesc}>{sis.descripcion}</div>}
                  <div style={s.badge}>Niveles: 1 – {sis.nivel_maximo}</div>
                </div>
              ))}
            </div>
          )}
          <div style={s.actions}>
            <button
              style={s.btnPrimary}
              disabled={!sistemaSeleccionado}
              onClick={() => setStep('nombre')}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}

      {step === 'nombre' && sistemaSeleccionado && (
        <>
          <p style={s.sub}>Sistema: <strong>{sistemaSeleccionado.nombre}</strong></p>
          <div style={s.step}>Paso 2 de 2 — Datos del personaje</div>
          <form onSubmit={handleCreate}>
            <div style={s.field}>
              <label style={s.label}>Nombre del personaje *</label>
              <input
                style={s.input}
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                autoFocus
                placeholder="Ej: Alindra Voss"
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Descripción (opcional)</label>
              <textarea
                style={s.textarea}
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Rasgos, trasfondo…"
              />
            </div>
            <div style={s.actions}>
              <button style={s.btnSecondary} type="button" onClick={() => setStep('sistema')}>
                ← Atrás
              </button>
              <button style={s.btnPrimary} type="submit" disabled={saving}>
                {saving ? 'Creando…' : 'Crear y abrir builder'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
