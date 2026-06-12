import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/services/api'

interface Usuario {
  id_usuario: number
  nombre: string
  email: string
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  _count: { personajes: number }
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<Usuario[]>('/api/usuarios')
      .then((r) => setUsuarios(r.data))
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }, [])

  const admins = usuarios.filter((u) => u.is_admin).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {loading ? '...' : `${usuarios.length} registrados · ${admins} admin${admins !== 1 ? 's' : ''}`}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            {loading ? 'Cargando...' : `${usuarios.length} usuario${usuarios.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {loading ? (
            <p className="text-sm text-muted-foreground animate-pulse">Cargando...</p>
          ) : usuarios.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay usuarios.</p>
          ) : (
            usuarios.map((u) => (
              <div
                key={u.id_usuario}
                className="flex items-center justify-between px-4 py-3 rounded-md border border-border bg-secondary/40 hover:bg-secondary/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {u.avatar_url ? (
                    <img
                      src={u.avatar_url}
                      alt={u.nombre}
                      className="h-8 w-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-fuchsia-600/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-fuchsia-400">
                        {u.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{u.nombre}</span>
                      {u.is_admin && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{u.email}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
                  <span>{u._count.personajes} personaje{u._count.personajes !== 1 ? 's' : ''}</span>
                  <span>{new Date(u.created_at).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
