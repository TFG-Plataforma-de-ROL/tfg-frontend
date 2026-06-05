import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { sistemaRolService } from '@/services/sistemaRolService'
import type { SistemaRol } from '@/types'

type FormData = { nombre: string; descripcion: string }
const emptyForm: FormData = { nombre: '', descripcion: '' }

export default function SistemasRolPage() {
  const [items, setItems] = useState<SistemaRol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SistemaRol | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<SistemaRol | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    sistemaRolService.getSistemasRol()
      .then(setItems)
      .catch(() => setError('Error al cargar los sistemas de rol'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (item: SistemaRol) => {
    setEditing(item)
    setForm({ nombre: item.nombre, descripcion: item.descripcion ?? '' })
    setFormError(null)
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      if (editing) {
        const updated = await sistemaRolService.updateSistemaRol(editing.id_sistema_rol, {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || undefined,
        })
        setItems((prev) => prev.map((i) => i.id_sistema_rol === updated.id_sistema_rol ? updated : i))
      } else {
        const created = await sistemaRolService.createSistemaRol({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || undefined,
        })
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
      await sistemaRolService.deleteSistemaRol(deleteTarget.id_sistema_rol)
      setItems((prev) => prev.filter((i) => i.id_sistema_rol !== deleteTarget.id_sistema_rol))
      setDeleteTarget(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error ?? 'Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sistemas de Rol</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestiona los sistemas de juego de rol</p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
        >
          <Plus className="h-4 w-4" /> Nuevo
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            {loading ? 'Cargando...' : `${items.length} sistema${items.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {loading ? (
            <p className="text-sm text-muted-foreground animate-pulse">Cargando...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay sistemas de rol. Crea el primero.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id_sistema_rol}
                className="flex items-center justify-between px-4 py-3 rounded-md border border-border bg-secondary/40 hover:bg-secondary/70 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">{item.nombre}</span>
                  {item.descripcion && (
                    <span className="text-xs text-muted-foreground">{item.descripcion}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:text-fuchsia-400"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:text-destructive"
                    onClick={() => setDeleteTarget(item)}
                  >
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
            <DialogTitle>{editing ? 'Editar sistema de rol' : 'Nuevo sistema de rol'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Modifica los datos del sistema de rol.' : 'Introduce los datos del nuevo sistema de rol.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Nombre *</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej: D&D 5e"
                className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Descripción</Label>
              <Input
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                placeholder="Descripción opcional"
                className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50"
              />
            </div>
            {formError && <p className="text-xs text-destructive">{formError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white gap-1"
              >
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
            <DialogTitle>Eliminar sistema de rol</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar <span className="font-medium text-foreground">"{deleteTarget?.nombre}"</span>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
