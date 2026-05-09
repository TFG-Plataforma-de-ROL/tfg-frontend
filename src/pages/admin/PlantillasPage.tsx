import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { plantillaService } from '../../services/plantillaService';
import { sistemaRolService } from '../../services/sistemaRolService';
import type { FichaPlantilla, SistemaRol } from '../../types';

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' } as const,
  title: { margin: 0, fontSize: '1.4rem' } as const,
  btnPrimary: { padding: '0.5rem 1.25rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem' } as const,
  btnDanger: { padding: '0.25rem 0.75rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' } as const,
  btnEdit: { padding: '0.25rem 0.75rem', background: '#f57c00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' } as const,
  btnCampos: { padding: '0.25rem 0.75rem', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' } as const,
  btnCancel: { padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem' } as const,
  form: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem' } as const,
  formTitle: { margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 } as const,
  field: { display: 'flex', flexDirection: 'column' as const, gap: 4, marginBottom: '0.75rem' } as const,
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#555' } as const,
  input: { padding: '0.45rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9rem' } as const,
  select: { padding: '0.45rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9rem' } as const,
  formActions: { display: 'flex', gap: '0.5rem' } as const,
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { padding: '0.75rem 1rem', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 700, color: '#555', background: '#fafafa', borderBottom: '2px solid #e0e0e0' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.875rem', verticalAlign: 'middle' as const },
  actions: { display: 'flex', gap: '0.4rem' } as const,
  err: { background: '#fde8e8', color: '#c62828', borderRadius: 4, padding: '0.6rem 0.75rem', marginBottom: '1rem', fontSize: '0.875rem' } as const,
  empty: { textAlign: 'center' as const, color: '#888', padding: '2rem', background: '#fff', borderRadius: 8 },
};

type FormState = { nombre_plantilla: string; id_sistema_rol: string; version: number };
const EMPTY: FormState = { nombre_plantilla: '', id_sistema_rol: '', version: 1 };

export default function PlantillasPage() {
  const navigate = useNavigate();
  const [plantillas, setPlantillas] = useState<FichaPlantilla[]>([]);
  const [sistemas, setSistemas] = useState<SistemaRol[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FichaPlantilla | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [p, sis] = await Promise.all([plantillaService.getAll(), sistemaRolService.getAll()]);
      setPlantillas(p);
      setSistemas(sis);
    } catch {
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm(EMPTY); setFormOpen(true); setError(''); }
  function openEdit(p: FichaPlantilla) {
    setEditing(p);
    setForm({ nombre_plantilla: p.nombre_plantilla, id_sistema_rol: String(p.id_sistema_rol ?? ''), version: p.version });
    setFormOpen(true); setError('');
  }
  function closeForm() { setFormOpen(false); setEditing(null); }

  async function handleSave() {
    if (!form.nombre_plantilla.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true); setError('');
    try {
      const data = {
        nombre_plantilla: form.nombre_plantilla,
        id_sistema_rol: form.id_sistema_rol ? Number(form.id_sistema_rol) : undefined,
        version: form.version,
      };
      if (editing) {
        await plantillaService.update(editing.id_plantilla, data);
      } else {
        await plantillaService.create(data);
      }
      await load();
      closeForm();
    } catch {
      setError('Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta plantilla y todos sus campos?')) return;
    try {
      await plantillaService.delete(id);
      setPlantillas(prev => prev.filter(p => p.id_plantilla !== id));
    } catch {
      setError('Error al eliminar.');
    }
  }

  return (
    <AdminLayout>
      <div style={s.header}>
        <h1 style={s.title}>Plantillas de ficha</h1>
        <button style={s.btnPrimary} onClick={openNew}>+ Nueva plantilla</button>
      </div>

      {error && <div style={s.err}>{error}</div>}

      {formOpen && (
        <div style={s.form}>
          <p style={s.formTitle}>{editing ? 'Editar plantilla' : 'Nueva plantilla'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={s.field}>
              <label style={s.label}>Nombre *</label>
              <input style={s.input} value={form.nombre_plantilla} onChange={e => setForm(f => ({ ...f, nombre_plantilla: e.target.value }))} autoFocus />
            </div>
            <div style={s.field}>
              <label style={s.label}>Sistema de rol</label>
              <select style={s.select} value={form.id_sistema_rol} onChange={e => setForm(f => ({ ...f, id_sistema_rol: e.target.value }))}>
                <option value="">— Sin sistema —</option>
                {sistemas.map(sis => (
                  <option key={sis.id_sistema_rol} value={sis.id_sistema_rol}>{sis.nombre}</option>
                ))}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Versión</label>
              <input style={s.input} type="number" min={1} value={form.version} onChange={e => setForm(f => ({ ...f, version: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={s.formActions}>
            <button style={s.btnPrimary} onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
            <button style={s.btnCancel} onClick={closeForm}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p>Cargando…</p> : plantillas.length === 0 ? (
        <div style={s.empty}>No hay plantillas. Crea la primera.</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Nombre</th>
              <th style={s.th}>Sistema</th>
              <th style={s.th}>Versión</th>
              <th style={s.th}>Campos</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {plantillas.map(p => (
              <tr key={p.id_plantilla}>
                <td style={{ ...s.td, fontWeight: 600 }}>{p.nombre_plantilla}</td>
                <td style={{ ...s.td, color: '#666' }}>
                  {sistemas.find(s => s.id_sistema_rol === p.id_sistema_rol)?.nombre ?? '—'}
                </td>
                <td style={s.td}>{p.version}</td>
                <td style={s.td}>{p.campos?.length ?? 0}</td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.btnCampos} onClick={() => navigate(`/admin/plantillas/${p.id_plantilla}/campos`)}>
                      Campos
                    </button>
                    <button style={s.btnEdit} onClick={() => openEdit(p)}>Editar</button>
                    <button style={s.btnDanger} onClick={() => handleDelete(p.id_plantilla)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
