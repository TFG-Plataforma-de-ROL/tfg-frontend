import { useEffect, useState } from 'react'
import { Plus, Trash2, X, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { itemService, type Item } from '@/services/itemService'
import { sistemaRolService } from '@/services/sistemaRolService'
import type { SistemaRol } from '@/types'

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESCUELAS = ['abjuracion', 'conjuracion', 'adivinacion', 'encantamiento', 'evocacion', 'ilusion', 'necromancia', 'transmutacion']
const SUBCATEGORIAS_DOTE = ['dotes-origen', 'dotes-pelea']

type Categoria = { id: string; label: string; tipos: { value: string; label: string }[] }

const CATEGORIAS: Categoria[] = [
  { id: 'raza',    label: 'Razas',    tipos: [{ value: 'raza',    label: 'Razas' }] },
  { id: 'hechizo', label: 'Hechizos', tipos: [{ value: 'hechizo', label: 'Hechizos' }] },
  { id: 'dote',    label: 'Dotes',    tipos: [{ value: 'dote',    label: 'Dotes' }] },
  { id: 'clase',   label: 'Clases',   tipos: [{ value: 'clase',   label: 'Clases' }] },
  {
    id: 'subclase', label: 'Subclases',
    tipos: [
      { value: 'subclase_guerrero', label: 'Guerrero' },
      { value: 'subclase_mago',     label: 'Mago' },
      { value: 'subclase_picaro',   label: 'Pícaro' },
      { value: 'subclase_clerigo',  label: 'Clérigo' },
    ],
  },
  { id: 'arma',          label: 'Armas',            tipos: [{ value: 'arma',          label: 'Armas' }] },
  { id: 'armadura',      label: 'Armaduras',        tipos: [{ value: 'armadura',      label: 'Armaduras' }] },
  { id: 'estilo_combate',label: 'Estilos combate',  tipos: [{ value: 'estilo_combate',label: 'Estilos combate' }] },
  { id: 'trasfondo',     label: 'Trasfondo',        tipos: [{ value: 'trasfondo',     label: 'Trasfondo' }] },
]

const TIPO_COLORS: Record<string, string> = {
  raza:    'bg-blue-500/20 text-blue-400 border-blue-500/30',
  clase:   'bg-green-500/20 text-green-400 border-green-500/30',
  hechizo: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  dote:    'bg-amber-500/20 text-amber-400 border-amber-500/30',
  trasfondo: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  estilo_combate: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}
const tipoColor = (tipo: string) => TIPO_COLORS[tipo] ?? 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30'

// ─── Tipos del formulario ──────────────────────────────────────────────────────

type Rasgo = { nombre: string; descripcion: string }

type RazaForm = {
  tamano: string
  velocidad: string
  rasgos: Rasgo[]
}

type HechizoForm = {
  nivel: string
  escuela: string
  tiempo_lanzamiento: string
  alcance: string
  verbal: boolean
  somatico: boolean
  material: boolean
  descripcion_material: string
  duracion: string
  concentracion: boolean
  ritual: boolean
  descripcion: string
  clases: string
}

type DoteForm = {
  nombre_original: string
  subcategoria: string
  categoria: string
  prerequisito: string
  repetible: boolean
  fuente: string
  descripcion: string
  beneficios: Rasgo[]
}

type TipoCreable = 'raza' | 'hechizo' | 'dote'

type ItemForm = {
  nombre: string
  tipo_item: TipoCreable
  id_sistema_rol: string
  raza: RazaForm
  hechizo: HechizoForm
  dote: DoteForm
}

const emptyRaza: RazaForm = { tamano: 'Mediano', velocidad: '30', rasgos: [{ nombre: '', descripcion: '' }] }
const emptyHechizo: HechizoForm = {
  nivel: '1', escuela: 'evocacion', tiempo_lanzamiento: '1 acción', alcance: '30 pies',
  verbal: true, somatico: false, material: false, descripcion_material: '',
  duracion: 'Instantánea', concentracion: false, ritual: false, descripcion: '', clases: '',
}
const emptyDote: DoteForm = {
  nombre_original: '', subcategoria: 'dotes-origen', categoria: '', prerequisito: '',
  repetible: false, fuente: 'PHB 2024', descripcion: '', beneficios: [{ nombre: '', descripcion: '' }],
}
const emptyForm: ItemForm = { nombre: '', tipo_item: 'raza', id_sistema_rol: '', raza: emptyRaza, hechizo: emptyHechizo, dote: emptyDote }

// ─── Helpers para construir el objeto datos ────────────────────────────────────

function buildDatos(form: ItemForm): { datos: unknown; subcategoria?: string } {
  const { nombre, tipo_item } = form
  if (tipo_item === 'raza') {
    const { tamano, velocidad, rasgos } = form.raza
    return {
      datos: {
        especie: {
          nombre,
          tamaño: tamano,
          velocidad: Number(velocidad) || 30,
          rasgos: rasgos.filter((r) => r.nombre.trim()),
        },
      },
    }
  }
  if (tipo_item === 'hechizo') {
    const h = form.hechizo
    return {
      datos: {
        hechizo: {
          nombre,
          nivel: Number(h.nivel),
          escuela: h.escuela,
          tiempo_lanzamiento: h.tiempo_lanzamiento,
          alcance: h.alcance,
          componentes: {
            verbal: h.verbal,
            somatico: h.somatico,
            material: h.material,
            descripcion_material: h.material && h.descripcion_material.trim() ? h.descripcion_material.trim() : null,
          },
          duracion: h.duracion,
          concentracion: h.concentracion,
          ritual: h.ritual,
          descripcion: h.descripcion,
          clases: h.clases.split(',').map((c) => c.trim()).filter(Boolean),
          escalado: null,
        },
      },
    }
  }
  // dote
  const d = form.dote
  return {
    datos: {
      dote: {
        nombre,
        nombre_original: d.nombre_original,
        categoria: d.categoria,
        prerequisito: d.prerequisito.trim() || null,
        repetible: d.repetible,
        fuente: d.fuente,
        descripcion: d.descripcion,
        beneficios: d.beneficios.filter((b) => b.nombre.trim()),
      },
    },
    subcategoria: d.subcategoria,
  }
}

// ─── Componentes auxiliares ────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}

function SelectField({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-9 w-full rounded-md border border-fuchsia-500/40 bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-fuchsia-500"
      />
      {label}
    </label>
  )
}

function ListEditor({ items, onChange, placeholder = { nombre: 'Nombre', descripcion: 'Descripción' } }: {
  items: Rasgo[]
  onChange: (items: Rasgo[]) => void
  placeholder?: { nombre: string; descripcion: string }
}) {
  const update = (i: number, field: keyof Rasgo, val: string) => {
    const next = items.map((r, idx) => idx === i ? { ...r, [field]: val } : r)
    onChange(next)
  }
  const add = () => onChange([...items, { nombre: '', descripcion: '' }])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="flex flex-col gap-2">
      {items.map((r, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex flex-col gap-1 flex-1">
            <Input
              value={r.nombre}
              onChange={(e) => update(i, 'nombre', e.target.value)}
              placeholder={placeholder.nombre}
              className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50 h-8 text-xs"
            />
            <Input
              value={r.descripcion}
              onChange={(e) => update(i, 'descripcion', e.target.value)}
              placeholder={placeholder.descripcion}
              className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50 h-8 text-xs"
            />
          </div>
          {items.length > 1 && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mt-0.5 hover:text-destructive" onClick={() => remove(i)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" className="self-start h-7 text-xs gap-1 border-fuchsia-500/30 hover:text-fuchsia-400" onClick={add}>
        <Plus className="h-3 w-3" /> Añadir
      </Button>
    </div>
  )
}

// ─── Secciones del formulario por tipo ────────────────────────────────────────

function RazaSection({ form, setForm }: { form: ItemForm; setForm: React.Dispatch<React.SetStateAction<ItemForm>> }) {
  const set = (patch: Partial<RazaForm>) => setForm((f) => ({ ...f, raza: { ...f.raza, ...patch } }))
  return (
    <>
      <FieldRow label="Tamaño">
        <SelectField
          value={form.raza.tamano}
          onChange={(v) => set({ tamano: v })}
          options={[{ value: 'Pequeño', label: 'Pequeño' }, { value: 'Mediano', label: 'Mediano' }, { value: 'Grande', label: 'Grande' }]}
        />
      </FieldRow>
      <FieldRow label="Velocidad (pies)">
        <Input
          type="number"
          value={form.raza.velocidad}
          onChange={(e) => set({ velocidad: e.target.value })}
          className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50"
        />
      </FieldRow>
      <FieldRow label="Rasgos">
        <ListEditor items={form.raza.rasgos} onChange={(rasgos) => set({ rasgos })} />
      </FieldRow>
    </>
  )
}

function HechizoSection({ form, setForm }: { form: ItemForm; setForm: React.Dispatch<React.SetStateAction<ItemForm>> }) {
  const set = (patch: Partial<HechizoForm>) => setForm((f) => ({ ...f, hechizo: { ...f.hechizo, ...patch } }))
  const h = form.hechizo
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Nivel">
          <SelectField
            value={h.nivel}
            onChange={(v) => set({ nivel: v })}
            options={[0,1,2,3,4,5,6,7,8,9].map((n) => ({ value: String(n), label: n === 0 ? 'Truco (0)' : `Nivel ${n}` }))}
          />
        </FieldRow>
        <FieldRow label="Escuela">
          <SelectField
            value={h.escuela}
            onChange={(v) => set({ escuela: v })}
            options={ESCUELAS.map((e) => ({ value: e, label: e.charAt(0).toUpperCase() + e.slice(1) }))}
          />
        </FieldRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Tiempo de lanzamiento">
          <Input value={h.tiempo_lanzamiento} onChange={(e) => set({ tiempo_lanzamiento: e.target.value })} className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50" />
        </FieldRow>
        <FieldRow label="Alcance">
          <Input value={h.alcance} onChange={(e) => set({ alcance: e.target.value })} className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50" />
        </FieldRow>
      </div>
      <FieldRow label="Duración">
        <Input value={h.duracion} onChange={(e) => set({ duracion: e.target.value })} className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50" />
      </FieldRow>
      <FieldRow label="Componentes">
        <div className="flex flex-wrap gap-4">
          <CheckField label="Verbal" checked={h.verbal} onChange={(v) => set({ verbal: v })} />
          <CheckField label="Somático" checked={h.somatico} onChange={(v) => set({ somatico: v })} />
          <CheckField label="Material" checked={h.material} onChange={(v) => set({ material: v })} />
        </div>
        {h.material && (
          <Input
            value={h.descripcion_material}
            onChange={(e) => set({ descripcion_material: e.target.value })}
            placeholder="Descripción del material..."
            className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50 mt-2"
          />
        )}
      </FieldRow>
      <div className="flex gap-6">
        <CheckField label="Concentración" checked={h.concentracion} onChange={(v) => set({ concentracion: v })} />
        <CheckField label="Ritual" checked={h.ritual} onChange={(v) => set({ ritual: v })} />
      </div>
      <FieldRow label="Descripción">
        <textarea
          value={h.descripcion}
          onChange={(e) => set({ descripcion: e.target.value })}
          rows={4}
          placeholder="Descripción del hechizo..."
          className="flex w-full rounded-md border border-fuchsia-500/40 bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50 resize-none"
        />
      </FieldRow>
      <FieldRow label="Clases (separadas por coma)">
        <Input
          value={h.clases}
          onChange={(e) => set({ clases: e.target.value })}
          placeholder="Mago, Hechicero, Brujo"
          className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50"
        />
      </FieldRow>
    </>
  )
}

function DoteSection({ form, setForm }: { form: ItemForm; setForm: React.Dispatch<React.SetStateAction<ItemForm>> }) {
  const set = (patch: Partial<DoteForm>) => setForm((f) => ({ ...f, dote: { ...f.dote, ...patch } }))
  const d = form.dote
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Nombre original">
          <Input value={d.nombre_original} onChange={(e) => set({ nombre_original: e.target.value })} placeholder="Alert" className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50" />
        </FieldRow>
        <FieldRow label="Subcategoría">
          <SelectField
            value={d.subcategoria}
            onChange={(v) => set({ subcategoria: v })}
            options={SUBCATEGORIAS_DOTE.map((s) => ({ value: s, label: s.replace('dotes-', '').charAt(0).toUpperCase() + s.replace('dotes-', '').slice(1) }))}
          />
        </FieldRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Categoría (texto)">
          <Input value={d.categoria} onChange={(e) => set({ categoria: e.target.value })} placeholder="Dote de Origen" className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50" />
        </FieldRow>
        <FieldRow label="Fuente">
          <Input value={d.fuente} onChange={(e) => set({ fuente: e.target.value })} className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50" />
        </FieldRow>
      </div>
      <FieldRow label="Prerequisito (opcional)">
        <Input value={d.prerequisito} onChange={(e) => set({ prerequisito: e.target.value })} placeholder="Ninguno" className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50" />
      </FieldRow>
      <CheckField label="Repetible" checked={d.repetible} onChange={(v) => set({ repetible: v })} />
      <FieldRow label="Descripción">
        <textarea
          value={d.descripcion}
          onChange={(e) => set({ descripcion: e.target.value })}
          rows={3}
          placeholder="Descripción del dote..."
          className="flex w-full rounded-md border border-fuchsia-500/40 bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50 resize-none"
        />
      </FieldRow>
      <FieldRow label="Beneficios">
        <ListEditor items={d.beneficios} onChange={(beneficios) => set({ beneficios })} placeholder={{ nombre: 'Nombre del beneficio', descripcion: 'Descripción' }} />
      </FieldRow>
    </>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [sistemas, setSistemas] = useState<SistemaRol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCategoria, setFilterCategoria] = useState('')
  const [filterSubtipo, setFilterSubtipo] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<ItemForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([itemService.getItems(), sistemaRolService.getSistemasRol()])
      .then(([i, s]) => { setItems(i); setSistemas(s) })
      .catch(() => setError('Error al cargar items'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setFormError(null)
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!form.nombre.trim()) { setFormError('El nombre es obligatorio'); return }
    setSaving(true)
    setFormError(null)
    try {
      const { datos, subcategoria } = buildDatos(form)
      const payload = {
        nombre: form.nombre.trim(),
        tipo_item: form.tipo_item,
        id_sistema_rol: form.id_sistema_rol ? Number(form.id_sistema_rol) : undefined,
        datos,
        subcategoria,
      }
      const created = await itemService.createItem(payload)
      setItems((prev) => [...prev, created])
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
    const tiposObjetivo = filterSubtipo ? [filterSubtipo] : categoriaActiva.tipos.map((t) => t.value)
    return items.filter((i) => tiposObjetivo.includes(i.tipo_item))
  })()

  const countCategoria = (cat: Categoria) => {
    const tipos = cat.tipos.map((t) => t.value)
    return items.filter((i) => tipos.includes(i.tipo_item)).length
  }

  const selectCategoria = (id: string) => { setFilterCategoria(id); setFilterSubtipo('') }

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

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => selectCategoria('')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterCategoria === '' ? 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/40' : 'border-border text-muted-foreground hover:text-foreground'}`}
        >
          Todos ({items.length})
        </button>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => selectCategoria(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterCategoria === cat.id ? 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/40' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            {cat.label} ({countCategoria(cat)})
          </button>
        ))}
      </div>

      {categoriaActiva && categoriaActiva.tipos.length > 1 && (
        <div className="flex flex-wrap gap-2 pl-1">
          <button
            onClick={() => setFilterSubtipo('')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterSubtipo === '' ? 'bg-fuchsia-600/10 text-fuchsia-300 border-fuchsia-500/30' : 'border-border/60 text-muted-foreground hover:text-foreground'}`}
          >
            Todas ({countCategoria(categoriaActiva)})
          </button>
          {categoriaActiva.tipos.map((t) => {
            const count = items.filter((i) => i.tipo_item === t.value).length
            return (
              <button
                key={t.value}
                onClick={() => setFilterSubtipo(t.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterSubtipo === t.value ? 'bg-fuchsia-600/10 text-fuchsia-300 border-fuchsia-500/30' : 'border-border/60 text-muted-foreground hover:text-foreground'}`}
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
            <p className="text-sm text-muted-foreground">No hay items.</p>
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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-destructive" onClick={() => setDeleteTarget(item)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Dialog crear */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) setFormOpen(false) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo item</DialogTitle>
            <DialogDescription>Rellena los datos para añadir un nuevo elemento al sistema.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            {/* Campos comunes */}
            <FieldRow label="Tipo *">
              <SelectField
                value={form.tipo_item}
                onChange={(v) => setForm((f) => ({ ...f, tipo_item: v as TipoCreable }))}
                options={[
                  { value: 'raza',    label: 'Raza' },
                  { value: 'hechizo', label: 'Hechizo' },
                  { value: 'dote',    label: 'Dote' },
                ]}
              />
            </FieldRow>
            <FieldRow label="Nombre *">
              <Input
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder={form.tipo_item === 'raza' ? 'Ej: Mediano' : form.tipo_item === 'hechizo' ? 'Ej: Bola de fuego' : 'Ej: Alerta'}
                className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50"
              />
            </FieldRow>
            <FieldRow label="Sistema de Rol">
              <SelectField
                value={form.id_sistema_rol}
                onChange={(v) => setForm((f) => ({ ...f, id_sistema_rol: v }))}
                options={[{ value: '', label: 'Sin sistema' }, ...sistemas.map((s) => ({ value: String(s.id_sistema_rol), label: s.nombre }))]}
              />
            </FieldRow>

            <hr className="border-border/40" />

            {/* Campos específicos por tipo */}
            {form.tipo_item === 'raza'    && <RazaSection    form={form} setForm={setForm} />}
            {form.tipo_item === 'hechizo' && <HechizoSection form={form} setForm={setForm} />}
            {form.tipo_item === 'dote'    && <DoteSection    form={form} setForm={setForm} />}

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
