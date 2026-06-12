import { useEffect, useState } from 'react'
import { Shield, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.get<Usuario[]>('/api/usuarios')
      .then((r) => setUsuarios(r.data))
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/api/usuarios/${deleteTarget.id_usuario}`)
      setUsuarios((prev) => prev.filter((u) => u.id_usuario !== deleteTarget.id_usuario))
      setDeleteTarget(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error ?? 'Error al eliminar el usuario')
    } finally {
      setDeleting(false)
    }
  }

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
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
                    <span>{u._count.personajes} personaje{u._count.personajes !== 1 ? 's' : ''}</span>
                    <span>{new Date(u.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:text-destructive"
                    onClick={() => setDeleteTarget(u)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar a{' '}
              <span className="font-medium text-foreground">"{deleteTarget?.nombre}"</span>?
              Se borrarán también todos sus personajes. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90 text-white">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
