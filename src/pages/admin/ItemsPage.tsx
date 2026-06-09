import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { itemService, type Item } from '@/services/itemService'
import { sistemaRolService } from '@/services/sistemaRolService'
import type { SistemaRol } from '@/types'

const TIPOS_ITEM = [
  'raza', 'clase', 'trasfondo', 'estilo_combate',
  'subclase_guerrero', 'subclase_mago', 'subclase_picaro', 'subclase_clerigo',
]

// Categorías de filtro. Cada categoría agrupa uno o varios tipo_item reales.
// Las que tienen varios subtipos muestran un segundo filtro para acotar.
type Categoria = {
  id: string
  label: string
  tipos: { value: string; label: string }[]
}

const CATEGORIAS: Categoria[] = [
  { id: 'clase', label: 'Clases', tipos: [{ value: 'clase', label: 'Clases' }] },
  {
    id: 'subclase',
    label: 'Subclases',
    tipos: [
      { value: 'subclase_guerrero', label: 'Guerrero' },
      { value: 'subclase_mago', label: 'Mago' },
      { value: 'subclase_picaro', label: 'Pícaro' },
      { value: 'subclase_clerigo', label: 'Clérigo' },
    ],
  },
  { id: 'hechizo', label: 'Hechizos', tipos: [{ value: 'hechizo', label: 'Hechizos' }] },
  { id: 'arma', label: 'Armas', tipos: [{ value: 'arma', label: 'Armas' }] },
  { id: 'armadura', label: 'Armaduras', tipos: [{ value: 'armadura', label: 'Armaduras' }] },
  { id: 'estilo_combate', label: 'Estilos de combate', tipos: [{ value: 'estilo_combate', label: 'Estilos de combate' }] },
  { id: 'trasfondo', label: 'Trasfondo', tipos: [{ value: 'trasfondo', label: 'Trasfondo' }] },
  { id: 'raza', label: 'Razas', tipos: [{ value: 'raza', label: 'Razas' }] },
]

type ItemForm = { nombre: string; tipo_item: string; id_sistema_rol: string; ruta_json: string }
const emptyForm: ItemForm = { nombre: '', tipo_item: TIPOS_ITEM[0], id_sistema_rol: '', ruta_json: '' }

const TIPO_COLORS: Record<string, string> = {
  raza: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  clase: 'bg-green-500/20 text-green-400 border-green-500/30',
  trasfondo: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  estilo_combate: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}
const tipoColor = (tipo: string) => TIPO_COLORS[tipo] ?? 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30'

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [sistemas, setSistemas] = useState<SistemaRol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCategoria, setFilterCategoria] = useState<string>('') // '' = Todos
  const [filterSubtipo, setFilterSubtipo] = useState<string>('') // '' = Todos los subtipos

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)
  const [form, setForm] = useState<ItemForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      itemService.getItems(),
      sistemaRolService.getSistemasRol(),
    ]).then(([i, s]) => {
      setItems(i)
      setSistemas(s)
    }).catch(() => setError('Error al cargar items'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (item: Item) => {
    setEditing(item)
    setForm({
      nombre: item.nombre,
      tipo_item: item.tipo_item,
      id_sistema_rol: item.id_sistema_rol ? String(item.id_sistema_rol) : '',
      ruta_json: typeof item.todos_datos === 'string' ? item.todos_datos : '',
    })
    setFormError(null)
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.tipo_item) { setFormError('Nombre y tipo son obligatorios'); return }
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        tipo_item: form.tipo_item,
        id_sistema_rol: form.id_sistema_rol ? Number(form.id_sistema_rol) : undefined,
        ruta_json: form.ruta_json.trim() || undefined,
      }
      if (editing) {
        const updated = await itemService.updateItem(editing.id_item, payload)
        setItems((prev) => prev.map((i) => i.id_item === updated.id_item ? updated : i))
      } else {
        const created = await itemService.createItem(payload)
        setItems((prev) => [...prev, created])
      }
      setFormOpen(false)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setFormError(e.response?.data?.error ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await itemService.deleteItem(deleteTarget.id_item)
      setItems((prev) => prev.filter((i) => i.id_item !== deleteTarget.id_item))
      setDeleteTarget(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error ?? 'Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  const nombreSistema = (id: number | null) =>
    id ? (sistemas.find((s) => s.id_sistema_rol === id)?.nombre ?? `ID ${id}`) : null

  const categoriaActiva = CATEGORIAS.find((c) => c.id === filterCategoria) ?? null

  const filtered = (() => {
    if (!categoriaActiva) return items
    // Si hay un subtipo concreto seleccionado, filtra por él; si no, por todos los tipos de la categoría.
    const tiposObjetivo = filterSubtipo
      ? [filterSubtipo]
      : categoriaActiva.tipos.map((t) => t.value)
    return items.filter((i) => tiposObjetivo.includes(i.tipo_item))
  })()

  const countCategoria = (cat: Categoria) => {
    const tipos = cat.tipos.map((t) => t.value)
    return items.filter((i) => tipos.includes(i.tipo_item)).length
  }

  const selectCategoria = (id: string) => {
    setFilterCategoria(id)
    setFilterSubtipo('')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Items</h1>
          <p className="text-muted-foreground text-sm mt-1">Razas, clases, trasfondos y opciones de personaje</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
          <Plus className="h-4 w-4" /> Nuevo
        </Button>
      </div>

      {/* Filtro por categoría */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => selectCategoria('')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            filterCategoria === ''
              ? 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/40'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Todos ({items.length})
        </button>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => selectCategoria(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterCategoria === cat.id
                ? 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/40'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.label} ({countCategoria(cat)})
          </button>
        ))}
      </div>

      {/* Segundo filtro: subtipos (solo si la categoría agrupa varios) */}
      {categoriaActiva && categoriaActiva.tipos.length > 1 && (
        <div className="flex flex-wrap gap-2 pl-1">
          <button
            onClick={() => setFilterSubtipo('')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterSubtipo === ''
                ? 'bg-fuchsia-600/10 text-fuchsia-300 border-fuchsia-500/30'
                : 'border-border/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            Todas ({countCategoria(categoriaActiva)})
          </button>
          {categoriaActiva.tipos.map((t) => {
            const count = items.filter((i) => i.tipo_item === t.value).length
            return (
              <button
                key={t.value}
                onClick={() => setFilterSubtipo(t.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filterSubtipo === t.value
                    ? 'bg-fuchsia-600/10 text-fuchsia-300 border-fuchsia-500/30'
                    : 'border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label} ({count})
              </button>
            )
          })}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            {loading ? 'Cargando...' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {loading ? (
            <p className="text-sm text-muted-foreground animate-pulse">Cargando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay items. Crea el primero.</p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id_item}
                className="flex items-center justify-between px-4 py-3 rounded-md border border-border bg-secondary/40 hover:bg-secondary/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${tipoColor(item.tipo_item)}`}>
                    {item.tipo_item}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{item.nombre}</span>
                    {item.id_sistema_rol && (
                      <span className="text-xs text-muted-foreground">{nombreSistema(item.id_sistema_rol)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-fuchsia-400" onClick={() => openEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-destructive" onClick={() => setDeleteTarget(item)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Dialog crear / editar */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) setFormOpen(false) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar item' : 'Nuevo item'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Modifica los datos del item.' : 'Introduce los datos del nuevo item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Nombre *</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej: Elfo"
                className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Tipo *</Label>
              <select
                value={form.tipo_item}
                onChange={(e) => setForm((f) => ({ ...f, tipo_item: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-fuchsia-500/40 bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50"
              >
                {TIPOS_ITEM.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Sistema de Rol</Label>
              <select
                value={form.id_sistema_rol}
                onChange={(e) => setForm((f) => ({ ...f, id_sistema_rol: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-fuchsia-500/40 bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50"
              >
                <option value="">Sin sistema</option>
                {sistemas.map((s) => <option key={s.id_sistema_rol} value={s.id_sistema_rol}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Ruta JSON</Label>
              <Input
                value={form.ruta_json}
                onChange={(e) => setForm((f) => ({ ...f, ruta_json: e.target.value }))}
                placeholder="Ej: /data/elfo.json"
                className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50"
              />
            </div>
            {formError && <p className="text-xs text-destructive">{formError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white gap-1">
                <Check className="h-3.5 w-3.5" /> {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar borrado */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar item</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar <span className="font-medium text-foreground">"{deleteTarget?.nombre}"</span>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</Button>
            <Button size="sm" onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90 text-white">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}