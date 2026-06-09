import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sistemaRolService } from '@/services/sistemaRolService'
import type { SistemaRol } from '@/types'

export default function SistemasRolPage() {
  const [items, setItems] = useState<SistemaRol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    sistemaRolService.getSistemasRol()
      .then(setItems)
      .catch(() => setError('Error al cargar los sistemas de rol'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Sistemas de Rol</h1>
        <p className="text-muted-foreground text-sm mt-1">Consulta los sistemas de juego de rol</p>
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
            <p className="text-sm text-muted-foreground">No hay sistemas de rol.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id_sistema_rol}
                className="flex items-center justify-between px-4 py-3 rounded-md border border-border bg-secondary/40"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">{item.nombre}</span>
                  {item.descripcion && (
                    <span className="text-xs text-muted-foreground">{item.descripcion}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}