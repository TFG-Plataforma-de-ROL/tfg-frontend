import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Swords } from 'lucide-react'
import { sistemaRolService } from '@/services/sistemaRolService'
import { personajeService } from '@/services/personajeService'
import { ROUTES } from '@/config/routes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { SistemaRol, Personaje } from '@/types'

export default function DashboardPage() {
  const navigate = useNavigate()

  const [sistemas, setSistemas] = useState<SistemaRol[]>([])
  const [selectedSistema, setSelectedSistema] = useState<SistemaRol | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  const [cargarOpen, setCargarOpen] = useState(false)
  const [personajes, setPersonajes] = useState<Personaje[]>([])
  const [loadingPersonajes, setLoadingPersonajes] = useState(false)

  useEffect(() => {
    sistemaRolService.getSistemasRol().then((data) => {
      setSistemas(data)
      if (data.length > 0) setSelectedSistema(data[0])
    }).finally(() => setLoadingData(false))
  }, [])

  const handleNuevoPersonaje = () => {
    if (!selectedSistema) return
    navigate(`${ROUTES.PRIVATE.PERSONAJE_NUEVO}?sistema=${selectedSistema.id_sistema_rol}`)
  }

  const handleCargarPersonaje = async () => {
    setCargarOpen(true)
    setLoadingPersonajes(true)
    try {
      const data = await personajeService.getPersonajes()
      const filtrados = selectedSistema
        ? data.filter((p) => p.id_sistema_rol === selectedSistema.id_sistema_rol)
        : data
      setPersonajes(filtrados)
    } finally {
      setLoadingPersonajes(false)
    }
  }

  const handleSelectPersonaje = (id: number) => {
    setCargarOpen(false)
    navigate(ROUTES.PRIVATE.PERSONAJE_EDITAR.replace(':id', String(id)))
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm animate-pulse">Cargando sistemas...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 pt-8">

      {/* Pills de sistemas */}
      {sistemas.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2">
          {sistemas.map((s) => (
            <button
              key={s.id_sistema_rol}
              onClick={() => setSelectedSistema(s)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                selectedSistema?.id_sistema_rol === s.id_sistema_rol
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {s.nombre}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No hay sistemas disponibles. Contacta con un administrador.
        </p>
      )}

      {/* Acciones */}
      <Card className="w-full max-w-md border-border/50">
        <CardContent className="flex flex-col gap-4 p-6">
          <button
            onClick={handleNuevoPersonaje}
            disabled={!selectedSistema}
            className={`group w-full rounded-xl border-2 px-6 py-8 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              selectedSistema
                ? 'border-primary/60 bg-secondary hover:bg-secondary/80 hover:border-primary'
                : 'border-border bg-secondary'
            }`}
          >
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-primary" />
              <div>
                <p className="text-base font-semibold text-foreground">Nuevo Personaje</p>
                {selectedSistema && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    para {selectedSistema.nombre}
                  </p>
                )}
              </div>
            </div>
          </button>

          <button
            onClick={handleCargarPersonaje}
            disabled={!selectedSistema}
            className="group w-full rounded-xl border-2 border-border bg-secondary px-6 py-8 text-left transition-all hover:bg-secondary/80 hover:border-border/80 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <div>
                <p className="text-base font-semibold text-foreground">Cargar Personaje</p>
                {selectedSistema && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ver mis personajes de {selectedSistema.nombre}
                  </p>
                )}
              </div>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Modal cargar personaje */}
      <Dialog open={cargarOpen} onOpenChange={setCargarOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-primary" />
              Mis Personajes
              {selectedSistema && (
                <span className="text-muted-foreground font-normal text-sm">
                  — {selectedSistema.nombre}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Selecciona un personaje para continuar editándolo.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex flex-col gap-2 max-h-72 overflow-y-auto">
            {loadingPersonajes ? (
              <p className="text-sm text-muted-foreground text-center py-6 animate-pulse">
                Cargando personajes...
              </p>
            ) : personajes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No tienes personajes en este sistema todavía.
              </p>
            ) : (
              personajes.map((p) => (
                <button
                  key={p.id_personaje}
                  onClick={() => handleSelectPersonaje(p.id_personaje)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-border bg-card hover:border-primary/60 hover:bg-secondary transition-all"
                >
                  <p className="text-sm font-medium text-foreground">{p.nombre}</p>
                  {p.descripcion && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.descripcion}</p>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => setCargarOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
