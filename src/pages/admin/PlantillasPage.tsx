import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { plantillaService, type Plantilla } from '@/services/plantillaService'
import { sistemaRolService } from '@/services/sistemaRolService'
import type { SistemaRol } from '@/types'

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [sistemas, setSistemas] = useState<SistemaRol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

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

  const nombreSistema = (id: number | null) =>
    id ? (sistemas.find((s) => s.id_sistema_rol === id)?.nombre ?? `ID ${id}`) : '—'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Plantillas</h1>
        <p className="text-muted-foreground text-sm mt-1">Consulta las plantillas de ficha de personaje</p>
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
            <p className="text-sm text-muted-foreground">No hay plantillas.</p>
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
                </div>

                {expanded === plantilla.id_plantilla && (
                  <div className="border-t border-border px-4 pb-3 pt-2">
                    <div className="mb-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                        Campos ({plantilla.campos?.length ?? 0})
                      </p>
                    </div>
                    {!plantilla.campos ? (
                      <p className="text-xs text-muted-foreground animate-pulse">Cargando campos...</p>
                    ) : plantilla.campos.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Sin campos definidos.</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {plantilla.campos.map((campo) => (
                          <div key={campo.id_campo} className="flex items-center px-3 py-1.5 rounded border border-border/50 bg-background/40">
                            <span className="text-xs font-medium">{campo.nombre_campo}</span>
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
    </div>
  )
}