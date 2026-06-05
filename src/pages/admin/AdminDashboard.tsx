import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, BookOpen, Swords, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { sistemaRolService } from '@/services/sistemaRolService'
import { plantillaService } from '@/services/plantillaService'
import { itemService } from '@/services/itemService'
import { ROUTES } from '@/config/routes'

interface Stats {
  sistemas: number
  plantillas: number
  items: number
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      sistemaRolService.getSistemasRol(),
      plantillaService.getPlantillas(),
      itemService.getItems(),
    ]).then(([sistemas, plantillas, items]) => {
      setStats({ sistemas: sistemas.length, plantillas: plantillas.length, items: items.length })
    }).finally(() => setLoading(false))
  }, [])

  const cards = [
    {
      title: 'Sistemas de Rol',
      icon: Layers,
      value: stats?.sistemas,
      description: 'Sistemas de juego de rol disponibles',
      route: ROUTES.ADMIN.SISTEMAS_ROL,
    },
    {
      title: 'Plantillas',
      icon: BookOpen,
      value: stats?.plantillas,
      description: 'Plantillas de ficha de personaje',
      route: ROUTES.ADMIN.PLANTILLAS,
    },
    {
      title: 'Items',
      icon: Swords,
      value: stats?.items,
      description: 'Razas, clases, trasfondos y más',
      route: ROUTES.ADMIN.ITEMS,
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona los recursos globales del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ title, icon: Icon, value, description, route }) => (
          <Card key={title} className="border-border/50 hover:border-fuchsia-500/40 transition-colors">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className="h-4 w-4 text-fuchsia-500" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-3xl font-bold">
                {loading ? <span className="text-muted-foreground animate-pulse">—</span> : value}
              </p>
              <p className="text-xs text-muted-foreground">{description}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-fuchsia-400 border-fuchsia-500/30 hover:bg-fuchsia-500/10"
                onClick={() => navigate(route)}
              >
                Gestionar <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
