import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { itemService } from '../../services/itemService';
import { sistemaRolService } from '../../services/sistemaRolService';
import type { Item, SistemaRol } from '../../types';

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' } as const,
  title: { margin: 0, fontSize: '1.4rem' } as const,
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' } as const,
  filterLabel: { fontSize: '0.85rem', color: '#555' } as const,
  select: { padding: '0.4rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.875rem' } as const,
  input: { padding: '0.45rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9rem' } as const,
  btnPrimary: { padding: '0.5rem 1.25rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem' } as const,
  btnDanger: { padding: '0.25rem 0.75rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' } as const,
  btnEdit: { padding: '0.25rem 0.75rem', background: '#f57c00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' } as const,
  btnCancel: { padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem' } as const,
  form: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem' } as const,
  formTitle: { margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 } as const,
  grid3: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' } as const,
  field: { display: 'flex', flexDirection: 'column' as const, gap: 4 } as const,
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#555' } as const,
  formActions: { display: 'flex', gap: '0.5rem' } as const,
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { padding: '0.75rem 1rem', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 700, color: '#555', background: '#fafafa', borderBottom: '2px solid #e0e0e0' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.875rem', verticalAlign: 'middle' as const },
  tag: { display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, background: '#ede7f6', color: '#512da8' } as const,
  actions: { display: 'flex', gap: '0.4rem' } as const,
  err: { background: '#fde8e8', color: '#c62828', borderRadius: 4, padding: '0.6rem 0.75rem', marginBottom: '1rem', fontSize: '0.875rem' } as const,
  empty: { textAlign: 'center' as const, color: '#888', padding: '2rem', background: '#fff', borderRadius: 8 },
  count: { fontSize: '0.85rem', color: '#666', marginLeft: 'auto' } as const,
};

type FormState = { nombre: string; tipo_item: string; id_sistema_rol: string };
const EMPTY: FormState = { nombre: '', tipo_item: '', id_sistema_rol: '' };

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [sistemas, setSistemas] = useState<SistemaRol[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterSistema, setFilterSistema] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  async function load() {
    try {
      const [it, sis] = await Promise.all([itemService.getAll(), sistemaRolService.getAll()]);
      setItems(it);
      setSistemas(sis);
    } catch {
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const tiposUnicos = [...new Set(items.map(i => i.tipo_item))].sort();

  const itemsFiltrados = items.filter(i => {
    if (filterSistema && String(i.id_sistema_rol ?? '') !== filterSistema) return false;
    if (filterTipo && i.tipo_item !== filterTipo) return false;
    return true;
  });

  function openNew() { setEditing(null); setForm(EMPTY); setFormOpen(true); setError(''); }
  function openEdit(item: Item) {
    setEditing(item);
    setForm({ nombre: item.nombre, tipo_item: item.tipo_item, id_sistema_rol: String(item.id_sistema_rol ?? '') });
    setFormOpen(true); setError('');
  }
  function closeForm() { setFormOpen(false); setEditing(null); }

  async function handleSave() {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    if (!form.tipo_item.trim()) { setError('El tipo de item es obligatorio.'); return; }
    setSaving(true); setError('');
    try {
      const data = {
        nombre: form.nombre,
        tipo_item: form.tipo_item,
        id_sistema_rol: form.id_sistema_rol ? Number(form.id_sistema_rol) : undefined,
      };
      if (editing) {
        await itemService.update(editing.id_item, data);
      } else {
        await itemService.create(data);
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
    if (!confirm('¿Eliminar este item?')) return;
    try {
      await itemService.delete(id);
      setItems(prev => prev.filter(i => i.id_item !== id));
    } catch {
      setError('Error al eliminar.');
    }
  }

  return (
    <AdminLayout>
      <div style={s.header}>
        <h1 style={s.title}>Items</h1>
        <button style={s.btnPrimary} onClick={openNew}>+ Nuevo item</button>
      </div>

      {error && <div style={s.err}>{error}</div>}

      {formOpen && (
        <div style={s.form}>
          <p style={s.formTitle}>{editing ? 'Editar item' : 'Nuevo item'}</p>
          <div style={s.grid3}>
            <div style={s.field}>
              <label style={s.label}>Nombre *</label>
              <input style={s.input} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} autoFocus placeholder="Ej: Elfo, Guerrero, Atletics…" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Tipo de item *</label>
              <input style={s.input} value={form.tipo_item} onChange={e => setForm(f => ({ ...f, tipo_item: e.target.value }))} placeholder="Ej: ancestry, class_feat…" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Sistema de rol</label>
              <select style={s.select} value={form.id_sistema_rol} onChange={e => setForm(f => ({ ...f, id_sistema_rol: e.target.value }))}>
                <option value="">— Global —</option>
                {sistemas.map(sis => (
                  <option key={sis.id_sistema_rol} value={sis.id_sistema_rol}>{sis.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={s.formActions}>
            <button style={s.btnPrimary} onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
            <button style={s.btnCancel} onClick={closeForm}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={s.filters}>
        <span style={s.filterLabel}>Filtrar:</span>
        <select style={s.select} value={filterSistema} onChange={e => setFilterSistema(e.target.value)}>
          <option value="">Todos los sistemas</option>
          {sistemas.map(sis => <option key={sis.id_sistema_rol} value={sis.id_sistema_rol}>{sis.nombre}</option>)}
        </select>
        <select style={s.select} value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {tiposUnicos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span style={s.count}>{itemsFiltrados.length} item{itemsFiltrados.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? <p>Cargando…</p> : itemsFiltrados.length === 0 ? (
        <div style={s.empty}>{items.length === 0 ? 'No hay items. Crea el primero.' : 'Ningún item coincide con los filtros.'}</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Nombre</th>
              <th style={s.th}>Tipo</th>
              <th style={s.th}>Sistema</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {itemsFiltrados.map(item => (
              <tr key={item.id_item}>
                <td style={{ ...s.td, fontWeight: 600 }}>{item.nombre}</td>
                <td style={s.td}><span style={s.tag}>{item.tipo_item}</span></td>
                <td style={{ ...s.td, color: '#666' }}>
                  {sistemas.find(s => s.id_sistema_rol === item.id_sistema_rol)?.nombre ?? '—'}
                </td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.btnEdit} onClick={() => openEdit(item)}>Editar</button>
                    <button style={s.btnDanger} onClick={() => handleDelete(item.id_item)}>Eliminar</button>
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
