import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { sistemaRolService } from '../../services/sistemaRolService';
import type { SistemaRol } from '../../types';

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' } as const,
  title: { margin: 0, fontSize: '1.4rem' } as const,
  btnPrimary: { padding: '0.5rem 1.25rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem' } as const,
  btnDanger: { padding: '0.25rem 0.75rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' } as const,
  btnEdit: { padding: '0.25rem 0.75rem', background: '#f57c00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' } as const,
  btnCancel: { padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem' } as const,
  form: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem' } as const,
  formTitle: { margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 } as const,
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' } as const,
  field: { display: 'flex', flexDirection: 'column' as const, gap: 4 } as const,
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#555' } as const,
  input: { padding: '0.45rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9rem' } as const,
  textarea: { padding: '0.45rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9rem', resize: 'vertical' as const, minHeight: 56 },
  formActions: { display: 'flex', gap: '0.5rem' } as const,
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { padding: '0.75rem 1rem', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 700, color: '#555', background: '#fafafa', borderBottom: '2px solid #e0e0e0' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.875rem', verticalAlign: 'middle' as const },
  actions: { display: 'flex', gap: '0.4rem' } as const,
  err: { background: '#fde8e8', color: '#c62828', borderRadius: 4, padding: '0.6rem 0.75rem', marginBottom: '1rem', fontSize: '0.875rem' } as const,
  empty: { textAlign: 'center' as const, color: '#888', padding: '2rem', background: '#fff', borderRadius: 8 },
};

type FormState = { nombre: string; descripcion: string; nivel_maximo: number };
const EMPTY: FormState = { nombre: '', descripcion: '', nivel_maximo: 1 };

export default function SistemasRolPage() {
  const [sistemas, setSistemas] = useState<SistemaRol[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SistemaRol | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      setSistemas(await sistemaRolService.getAll());
    } catch {
      setError('Error al cargar los sistemas de rol.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm(EMPTY); setFormOpen(true); setError(''); }
  function openEdit(s: SistemaRol) {
    setEditing(s);
    setForm({ nombre: s.nombre, descripcion: s.descripcion ?? '', nivel_maximo: s.nivel_maximo });
    setFormOpen(true);
    setError('');
  }
  function closeForm() { setFormOpen(false); setEditing(null); }

  async function handleSave() {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true); setError('');
    try {
      if (editing) {
        await sistemaRolService.update(editing.id_sistema_rol, {
          nombre: form.nombre,
          descripcion: form.descripcion || undefined,
          nivel_maximo: form.nivel_maximo,
        });
      } else {
        await sistemaRolService.create({
          nombre: form.nombre,
          descripcion: form.descripcion || undefined,
          nivel_maximo: form.nivel_maximo,
        });
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
    if (!confirm('¿Eliminar este sistema de rol? Se eliminarán también sus personajes y plantillas.')) return;
    try {
      await sistemaRolService.delete(id);
      setSistemas(prev => prev.filter(s => s.id_sistema_rol !== id));
    } catch {
      setError('Error al eliminar.');
    }
  }

  return (
    <AdminLayout>
      <div style={s.header}>
        <h1 style={s.title}>Sistemas de rol</h1>
        <button style={s.btnPrimary} onClick={openNew}>+ Nuevo sistema</button>
      </div>

      {error && <div style={s.err}>{error}</div>}

      {formOpen && (
        <div style={s.form}>
          <p style={s.formTitle}>{editing ? 'Editar sistema' : 'Nuevo sistema de rol'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={s.field}>
              <label style={s.label}>Nombre *</label>
              <input style={s.input} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} autoFocus />
            </div>
            <div style={s.field}>
              <label style={s.label}>Nivel máximo</label>
              <input style={s.input} type="number" min={1} max={30} value={form.nivel_maximo} onChange={e => setForm(f => ({ ...f, nivel_maximo: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={{ ...s.field, marginBottom: '0.75rem' }}>
            <label style={s.label}>Descripción</label>
            <textarea style={s.textarea} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
          </div>
          <div style={s.formActions}>
            <button style={s.btnPrimary} onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button style={s.btnCancel} onClick={closeForm}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p>Cargando…</p> : sistemas.length === 0 ? (
        <div style={s.empty}>No hay sistemas de rol. Crea el primero.</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Nombre</th>
              <th style={s.th}>Descripción</th>
              <th style={s.th}>Niveles</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {sistemas.map(sis => (
              <tr key={sis.id_sistema_rol}>
                <td style={{ ...s.td, fontWeight: 600 }}>{sis.nombre}</td>
                <td style={{ ...s.td, color: '#666' }}>{sis.descripcion ?? '—'}</td>
                <td style={s.td}>1 – {sis.nivel_maximo}</td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.btnEdit} onClick={() => openEdit(sis)}>Editar</button>
                    <button style={s.btnDanger} onClick={() => handleDelete(sis.id_sistema_rol)}>Eliminar</button>
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
