import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { plantillaService } from '../../services/plantillaService';
import type { FichaPlantilla, CampoPlantilla } from '../../types';

const TIPO_CAMPO_OPTIONS = ['texto', 'numero', 'item'] as const;

const s = {
  back: { background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', padding: 0, fontSize: '0.875rem', marginBottom: '1rem', display: 'block' } as const,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' } as const,
  title: { margin: 0, fontSize: '1.4rem' } as const,
  subtitle: { margin: '0.25rem 0 0', color: '#666', fontSize: '0.85rem' } as const,
  btnPrimary: { padding: '0.5rem 1.25rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem' } as const,
  btnDanger: { padding: '0.25rem 0.75rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' } as const,
  btnEdit: { padding: '0.25rem 0.75rem', background: '#f57c00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' } as const,
  btnCancel: { padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem' } as const,
  form: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem' } as const,
  formTitle: { margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 } as const,
  grid: { display: 'grid', gridTemplateColumns: '2fr 100px 120px 1fr', gap: '0.75rem', marginBottom: '0.75rem' } as const,
  field: { display: 'flex', flexDirection: 'column' as const, gap: 4 } as const,
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#555' } as const,
  input: { padding: '0.45rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9rem' } as const,
  select: { padding: '0.45rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9rem' } as const,
  formActions: { display: 'flex', gap: '0.5rem' } as const,
  hint: { fontSize: '0.75rem', color: '#888', marginTop: 2 } as const,
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { padding: '0.75rem 1rem', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 700, color: '#555', background: '#fafafa', borderBottom: '2px solid #e0e0e0' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.875rem', verticalAlign: 'middle' as const },
  badge: (tipo: string) => ({
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: 12,
    fontSize: '0.75rem',
    fontWeight: 700,
    background: tipo === 'item' ? '#e8f5e9' : tipo === 'numero' ? '#e3f2fd' : '#fff3e0',
    color: tipo === 'item' ? '#2e7d32' : tipo === 'numero' ? '#1565c0' : '#e65100',
  } as const),
  actions: { display: 'flex', gap: '0.4rem' } as const,
  err: { background: '#fde8e8', color: '#c62828', borderRadius: 4, padding: '0.6rem 0.75rem', marginBottom: '1rem', fontSize: '0.875rem' } as const,
  empty: { textAlign: 'center' as const, color: '#888', padding: '2rem', background: '#fff', borderRadius: 8 },
};

type FormState = { nombre_campo: string; nivel_disponible: number; tipo_campo: string; filtro_item: string };
const EMPTY: FormState = { nombre_campo: '', nivel_disponible: 1, tipo_campo: 'texto', filtro_item: '' };

export default function CamposPage() {
  const { plantillaId } = useParams<{ plantillaId: string }>();
  const navigate = useNavigate();
  const pid = Number(plantillaId);

  const [plantilla, setPlantilla] = useState<FichaPlantilla | null>(null);
  const [campos, setCampos] = useState<CampoPlantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CampoPlantilla | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const p = await plantillaService.getById(pid);
      setPlantilla(p);
      setCampos(p.campos ?? []);
    } catch {
      setError('Error al cargar la plantilla.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [pid]);

  function openNew() { setEditing(null); setForm(EMPTY); setFormOpen(true); setError(''); }
  function openEdit(c: CampoPlantilla) {
    setEditing(c);
    setForm({ nombre_campo: c.nombre_campo, nivel_disponible: c.nivel_disponible, tipo_campo: c.tipo_campo, filtro_item: c.filtro_item ?? '' });
    setFormOpen(true); setError('');
  }
  function closeForm() { setFormOpen(false); setEditing(null); }

  async function handleSave() {
    if (!form.nombre_campo.trim()) { setError('El nombre del campo es obligatorio.'); return; }
    setSaving(true); setError('');
    try {
      const data = {
        nombre_campo: form.nombre_campo,
        nivel_disponible: form.nivel_disponible,
        tipo_campo: form.tipo_campo,
        filtro_item: form.tipo_campo === 'item' ? (form.filtro_item || undefined) : undefined,
      };
      if (editing) {
        await plantillaService.updateCampo(pid, editing.id_campo_plantilla, data);
      } else {
        await plantillaService.createCampo(pid, data);
      }
      await load();
      closeForm();
    } catch {
      setError('Error al guardar el campo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(campoId: number) {
    if (!confirm('¿Eliminar este campo?')) return;
    try {
      await plantillaService.deleteCampo(pid, campoId);
      setCampos(prev => prev.filter(c => c.id_campo_plantilla !== campoId));
    } catch {
      setError('Error al eliminar el campo.');
    }
  }

  return (
    <AdminLayout>
      <button style={s.back} onClick={() => navigate('/admin/plantillas')}>← Volver a plantillas</button>

      <div style={s.header}>
        <div>
          <h1 style={s.title}>Campos de plantilla</h1>
          {plantilla && <p style={s.subtitle}>{plantilla.nombre_plantilla}</p>}
        </div>
        <button style={s.btnPrimary} onClick={openNew}>+ Nuevo campo</button>
      </div>

      {error && <div style={s.err}>{error}</div>}

      {formOpen && (
        <div style={s.form}>
          <p style={s.formTitle}>{editing ? 'Editar campo' : 'Nuevo campo'}</p>
          <div style={s.grid}>
            <div style={s.field}>
              <label style={s.label}>Nombre del campo *</label>
              <input style={s.input} value={form.nombre_campo} onChange={e => setForm(f => ({ ...f, nombre_campo: e.target.value }))} autoFocus placeholder="Ej: Clase, Ancestría, Fuerza…" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Nivel</label>
              <input style={s.input} type="number" min={1} value={form.nivel_disponible} onChange={e => setForm(f => ({ ...f, nivel_disponible: Number(e.target.value) }))} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Tipo</label>
              <select style={s.select} value={form.tipo_campo} onChange={e => setForm(f => ({ ...f, tipo_campo: e.target.value, filtro_item: '' }))}>
                {TIPO_CAMPO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Filtro de item</label>
              <input
                style={{ ...s.input, background: form.tipo_campo !== 'item' ? '#f5f5f5' : '#fff' }}
                value={form.filtro_item}
                onChange={e => setForm(f => ({ ...f, filtro_item: e.target.value }))}
                disabled={form.tipo_campo !== 'item'}
                placeholder={form.tipo_campo === 'item' ? 'Ej: ancestry, class_feat…' : '—'}
              />
              {form.tipo_campo === 'item' && <span style={s.hint}>Debe coincidir con el tipo_item de los Items</span>}
            </div>
          </div>
          <div style={s.formActions}>
            <button style={s.btnPrimary} onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
            <button style={s.btnCancel} onClick={closeForm}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p>Cargando…</p> : campos.length === 0 ? (
        <div style={s.empty}>Esta plantilla no tiene campos. Añade el primero.</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Nombre</th>
              <th style={s.th}>Nivel</th>
              <th style={s.th}>Tipo</th>
              <th style={s.th}>Filtro item</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {[...campos].sort((a, b) => a.nivel_disponible - b.nivel_disponible).map(c => (
              <tr key={c.id_campo_plantilla}>
                <td style={{ ...s.td, fontWeight: 600 }}>{c.nombre_campo}</td>
                <td style={s.td}>{c.nivel_disponible}</td>
                <td style={s.td}><span style={s.badge(c.tipo_campo)}>{c.tipo_campo}</span></td>
                <td style={{ ...s.td, color: '#666', fontFamily: 'monospace', fontSize: '0.8rem' }}>{c.filtro_item ?? '—'}</td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.btnEdit} onClick={() => openEdit(c)}>Editar</button>
                    <button style={s.btnDanger} onClick={() => handleDelete(c.id_campo_plantilla)}>Eliminar</button>
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
