import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { plantillaService, type Plantilla, type Campo } from '@/services/plantillaService'
import { sistemaRolService } from '@/services/sistemaRolService'
import type { SistemaRol } from '@/types'

type PlantillaForm = { nombre_plantilla: string; id_sistema_rol: string; version: string }
type CampoForm = { nombre_campo: string }
const emptyPlantilla: PlantillaForm = { nombre_plantilla: '', id_sistema_rol: '', version: '' }
const emptyCampo: CampoForm = { nombre_campo: '' }

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [sistemas, setSistemas] = useState<SistemaRol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  // Form plantilla
  const [plantillaFormOpen, setPlantillaFormOpen] = useState(false)
  const [editingPlantilla, setEditingPlantilla] = useState<Plantilla | null>(null)
  const [plantillaForm, setPlantillaForm] = useState<PlantillaForm>(emptyPlantilla)
  const [savingPlantilla, setSavingPlantilla] = useState(false)
  const [plantillaFormError, setPlantillaFormError] = useState<string | null>(null)
  const [deletePlantillaTarget, setDeletePlantillaTarget] = useState<Plantilla | null>(null)
  const [deletingPlantilla, setDeletingPlantilla] = useState(false)

  // Form campo
  const [campoFormOpen, setCampoFormOpen] = useState(false)
  const [editingCampo, setEditingCampo] = useState<{ campo: Campo; plantillaId: number } | null>(null)
  const [campoForm, setCampoForm] = useState<CampoForm>(emptyCampo)
  const [campoPlantillaId, setCampoPlantillaId] = useState<number | null>(null)
  const [savingCampo, setSavingCampo] = useState(false)
  const [campoFormError, setCampoFormError] = useState<string | null>(null)
  const [deleteCampoTarget, setDeleteCampoTarget] = useState<{ campo: Campo; plantillaId: number } | null>(null)
  const [deletingCampo, setDeletingCampo] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      plantillaService.getPlantillas(),
      sistemaRolService.getSistemasRol(),
    ]).then(([p, s]) => {
      setPlantillas(p)
      setSistemas(s)
    }).catch(() => setError('Error al cargar plantillas'))
      .finally(() => setLoading(false))
  }

  const loadCampos = async (plantillaId: number) => {
    const detail = await plantillaService.getPlantillaById(plantillaId)
    setPlantillas((prev) => prev.map((p) => p.id_plantilla === plantillaId ? { ...p, campos: detail.campos } : p))
  }

  useEffect(() => { load() }, [])

  const toggleExpand = async (id: number) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    const plantilla = plantillas.find((p) => p.id_plantilla === id)
    if (!plantilla?.campos) await loadCampos(id)
  }

  // --- Plantilla CRUD ---
  const openCreatePlantilla = () => {
    setEditingPlantilla(null)
    setPlantillaForm(emptyPlantilla)
    setPlantillaFormError(null)
    setPlantillaFormOpen(true)
  }

  const openEditPlantilla = (p: Plantilla) => {
    setEditingPlantilla(p)
    setPlantillaForm({
      nombre_plantilla: p.nombre_plantilla,
      id_sistema_rol: p.id_sistema_rol ? String(p.id_sistema_rol) : '',
      version: p.version ?? '',
    })
    setPlantillaFormError(null)
    setPlantillaFormOpen(true)
  }

  const handleSavePlantilla = async () => {
    if (!plantillaForm.nombre_plantilla.trim()) { setPlantillaFormError('Nombre obligatorio'); return }
    setSavingPlantilla(true)
    setPlantillaFormError(null)
    try {
      const payload = {
        nombre_plantilla: plantillaForm.nombre_plantilla.trim(),
        id_sistema_rol: plantillaForm.id_sistema_rol ? Number(plantillaForm.id_sistema_rol) : undefined,
        version: plantillaForm.version.trim() || undefined,
      }
      if (editingPlantilla) {
        const updated = await plantillaService.updatePlantilla(editingPlantilla.id_plantilla, payload)
        setPlantillas((prev) => prev.map((p) => p.id_plantilla === updated.id_plantilla ? { ...p, ...updated } : p))
      } else {
        const created = await plantillaService.createPlantilla(payload)
        setPlantillas((prev) => [...prev, created])
      }
      setPlantillaFormOpen(false)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setPlantillaFormError(e.response?.data?.error ?? 'Error al guardar')
    } finally {
      setSavingPlantilla(false)
    }
  }

  const handleDeletePlantilla = async () => {
    if (!deletePlantillaTarget) return
    setDeletingPlantilla(true)
    try {
      await plantillaService.deletePlantilla(deletePlantillaTarget.id_plantilla)
      setPlantillas((prev) => prev.filter((p) => p.id_plantilla !== deletePlantillaTarget.id_plantilla))
      if (expanded === deletePlantillaTarget.id_plantilla) setExpanded(null)
      setDeletePlantillaTarget(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error ?? 'Error al eliminar plantilla')
    } finally {
      setDeletingPlantilla(false)
    }
  }

  // --- Campo CRUD ---
  const openCreateCampo = (plantillaId: number) => {
    setEditingCampo(null)
    setCampoPlantillaId(plantillaId)
    setCampoForm(emptyCampo)
    setCampoFormError(null)
    setCampoFormOpen(true)
  }

  const openEditCampo = (campo: Campo, plantillaId: number) => {
    setEditingCampo({ campo, plantillaId })
    setCampoPlantillaId(plantillaId)
    setCampoForm({ nombre_campo: campo.nombre_campo })
    setCampoFormError(null)
    setCampoFormOpen(true)
  }

  const handleSaveCampo = async () => {
    if (!campoForm.nombre_campo.trim()) { setCampoFormError('Nombre obligatorio'); return }
    if (!campoPlantillaId) return
    setSavingCampo(true)
    setCampoFormError(null)
    try {
      if (editingCampo) {
        await plantillaService.updateCampo(editingCampo.plantillaId, editingCampo.campo.id_campo, {
          nombre_campo: campoForm.nombre_campo.trim(),
        })
        setPlantillas((prev) => prev.map((p) =>
          p.id_plantilla === editingCampo.plantillaId
            ? { ...p, campos: p.campos?.map((c) => c.id_campo === editingCampo.campo.id_campo ? { ...c, nombre_campo: campoForm.nombre_campo.trim() } : c) }
            : p
        ))
      } else {
        const created = await plantillaService.createCampo(campoPlantillaId, { nombre_campo: campoForm.nombre_campo.trim() })
        setPlantillas((prev) => prev.map((p) =>
          p.id_plantilla === campoPlantillaId
            ? { ...p, campos: [...(p.campos ?? []), created] }
            : p
        ))
      }
      setCampoFormOpen(false)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setCampoFormError(e.response?.data?.error ?? 'Error al guardar campo')
    } finally {
      setSavingCampo(false)
    }
  }

  const handleDeleteCampo = async () => {
    if (!deleteCampoTarget) return
    setDeletingCampo(true)
    try {
      await plantillaService.deleteCampo(deleteCampoTarget.plantillaId, deleteCampoTarget.campo.id_campo)
      setPlantillas((prev) => prev.map((p) =>
        p.id_plantilla === deleteCampoTarget.plantillaId
          ? { ...p, campos: p.campos?.filter((c) => c.id_campo !== deleteCampoTarget.campo.id_campo) }
          : p
      ))
      setDeleteCampoTarget(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error ?? 'Error al eliminar campo')
    } finally {
      setDeletingCampo(false)
    }
  }

  const nombreSistema = (id: number | null) =>
    id ? (sistemas.find((s) => s.id_sistema_rol === id)?.nombre ?? `ID ${id}`) : '—'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plantillas</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestiona las plantillas de ficha de personaje</p>
        </div>
        <Button onClick={openCreatePlantilla} className="gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
          <Plus className="h-4 w-4" /> Nueva
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            {loading ? 'Cargando...' : `${plantillas.length} plantilla${plantillas.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {loading ? (
            <p className="text-sm text-muted-foreground animate-pulse">Cargando...</p>
          ) : plantillas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay plantillas. Crea la primera.</p>
          ) : (
            plantillas.map((plantilla) => (
              <div key={plantilla.id_plantilla} className="rounded-md border border-border bg-secondary/40">
                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    className="flex items-center gap-2 text-left hover:text-fuchsia-400 transition-colors"
                    onClick={() => toggleExpand(plantilla.id_plantilla)}
                  >
                    {expanded === plantilla.id_plantilla
                      ? <ChevronDown className="h-4 w-4 shrink-0" />
                      : <ChevronRight className="h-4 w-4 shrink-0" />
                    }
                    <div>
                      <span className="font-medium text-sm">{plantilla.nombre_plantilla}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {nombreSistema(plantilla.id_sistema_rol)}
                        {plantilla.version && ` · v${plantilla.version}`}
                      </span>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-fuchsia-400" onClick={() => openEditPlantilla(plantilla)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-destructive" onClick={() => setDeletePlantillaTarget(plantilla)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {expanded === plantilla.id_plantilla && (
                  <div className="border-t border-border px-4 pb-3 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                        Campos ({plantilla.campos?.length ?? 0})
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs text-fuchsia-400 border-fuchsia-500/30 hover:bg-fuchsia-500/10"
                        onClick={() => openCreateCampo(plantilla.id_plantilla)}
                      >
                        <Plus className="h-3 w-3" /> Campo
                      </Button>
                    </div>
                    {!plantilla.campos ? (
                      <p className="text-xs text-muted-foreground animate-pulse">Cargando campos...</p>
                    ) : plantilla.campos.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Sin campos definidos.</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {plantilla.campos.map((campo) => (
                          <div key={campo.id_campo} className="flex items-center justify-between px-3 py-1.5 rounded border border-border/50 bg-background/40">
                            <span className="text-xs font-medium">{campo.nombre_campo}</span>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-fuchsia-400" onClick={() => openEditCampo(campo, plantilla.id_plantilla)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-destructive" onClick={() => setDeleteCampoTarget({ campo, plantillaId: plantilla.id_plantilla })}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Dialog plantilla */}
      <Dialog open={plantillaFormOpen} onOpenChange={(open) => { if (!open) setPlantillaFormOpen(false) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingPlantilla ? 'Editar plantilla' : 'Nueva plantilla'}</DialogTitle>
            <DialogDescription>
              {editingPlantilla ? 'Modifica los datos de la plantilla.' : 'Introduce los datos de la nueva plantilla.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Nombre *</Label>
              <Input
                value={plantillaForm.nombre_plantilla}
                onChange={(e) => setPlantillaForm((f) => ({ ...f, nombre_plantilla: e.target.value }))}
                placeholder="Ej: Ficha D&D 5e"
                className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Sistema de Rol</Label>
              <select
                value={plantillaForm.id_sistema_rol}
                onChange={(e) => setPlantillaForm((f) => ({ ...f, id_sistema_rol: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-fuchsia-500/40 bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50"
              >
                <option value="">Sin sistema</option>
                {sistemas.map((s) => (
                  <option key={s.id_sistema_rol} value={s.id_sistema_rol}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Versión</Label>
              <Input
                value={plantillaForm.version}
                onChange={(e) => setPlantillaForm((f) => ({ ...f, version: e.target.value }))}
                placeholder="Ej: 1.0"
                className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50"
              />
            </div>
            {plantillaFormError && <p className="text-xs text-destructive">{plantillaFormError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPlantillaFormOpen(false)} disabled={savingPlantilla}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSavePlantilla} disabled={savingPlantilla} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white gap-1">
                <Check className="h-3.5 w-3.5" /> {savingPlantilla ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog campo */}
      <Dialog open={campoFormOpen} onOpenChange={(open) => { if (!open) setCampoFormOpen(false) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingCampo ? 'Editar campo' : 'Nuevo campo'}</DialogTitle>
            <DialogDescription>
              {editingCampo ? 'Modifica el nombre del campo.' : 'Introduce el nombre del nuevo campo.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Nombre del campo *</Label>
              <Input
                value={campoForm.nombre_campo}
                onChange={(e) => setCampoForm({ nombre_campo: e.target.value })}
                placeholder="Ej: Fuerza"
                className="border-fuchsia-500/40 focus-visible:ring-fuchsia-500/50"
              />
            </div>
            {campoFormError && <p className="text-xs text-destructive">{campoFormError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setCampoFormOpen(false)} disabled={savingCampo}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveCampo} disabled={savingCampo} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white gap-1">
                <Check className="h-3.5 w-3.5" /> {savingCampo ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog borrar plantilla */}
      <Dialog open={!!deletePlantillaTarget} onOpenChange={(open) => { if (!open) setDeletePlantillaTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar plantilla</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar <span className="font-medium text-foreground">"{deletePlantillaTarget?.nombre_plantilla}"</span>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeletePlantillaTarget(null)} disabled={deletingPlantilla}>Cancelar</Button>
            <Button size="sm" onClick={handleDeletePlantilla} disabled={deletingPlantilla} className="bg-destructive hover:bg-destructive/90 text-white">
              {deletingPlantilla ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog borrar campo */}
      <Dialog open={!!deleteCampoTarget} onOpenChange={(open) => { if (!open) setDeleteCampoTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar campo</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar el campo <span className="font-medium text-foreground">"{deleteCampoTarget?.campo.nombre_campo}"</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteCampoTarget(null)} disabled={deletingCampo}>Cancelar</Button>
            <Button size="sm" onClick={handleDeleteCampo} disabled={deletingCampo} className="bg-destructive hover:bg-destructive/90 text-white">
              {deletingCampo ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
