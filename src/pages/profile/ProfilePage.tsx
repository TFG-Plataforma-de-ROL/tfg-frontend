import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Camera } from 'lucide-react'
import { useAuth } from '@/hooks'
import { usuarioService } from '@/services/usuarioService'
import { formatDate, validateEmail, validatePassword } from '@/utils/helpers'
import { ROUTES } from '@/config/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface PerfilData {
  id_usuario: number
  nombre: string
  email: string
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  personajes: Array<{
    id_personaje: number
    nombre: string
    descripcion: string | null
    sistema_rol: { nombre: string } | null
  }>
}

type Msg = { tipo: 'ok' | 'err'; texto: string }

function FeedbackMsg({ msg }: { msg: Msg | null }) {
  if (!msg) return null
  return (
    <p className={`text-xs mt-1 ${msg.tipo === 'ok' ? 'text-green-400' : 'text-destructive'}`}>
      {msg.texto}
    </p>
  )
}

export default function ProfilePage() {
  const { usuario, updateUsuario } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [perfil, setPerfil] = useState<PerfilData | null>(null)
  const [loadingPerfil, setLoadingPerfil] = useState(true)

  // Avatar
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState<Msg | null>(null)

  // Nombre
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nombreLoading, setNombreLoading] = useState(false)
  const [nombreMsg, setNombreMsg] = useState<Msg | null>(null)

  // Email
  const [nuevoEmail, setNuevoEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMsg, setEmailMsg] = useState<Msg | null>(null)

  // Contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passErrors, setPassErrors] = useState<Record<string, string>>({})
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg, setPassMsg] = useState<Msg | null>(null)

  useEffect(() => {
    usuarioService.getMe()
      .then((data: PerfilData) => {
        setPerfil(data)
        setNuevoNombre(data.nombre)
        setNuevoEmail(data.email)
      })
      .finally(() => setLoadingPerfil(false))
  }, [])

  // ── Avatar ────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    setAvatarMsg(null)
    try {
      const result = await usuarioService.uploadAvatar(file)
      setPerfil((p) => p ? { ...p, avatar_url: result.avatar_url } : p)
      updateUsuario({ avatar_url: result.avatar_url })
      setAvatarMsg({ tipo: 'ok', texto: 'Avatar actualizado' })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setAvatarMsg({ tipo: 'err', texto: e.response?.data?.error ?? 'Error al subir la imagen' })
    } finally {
      setAvatarLoading(false)
      e.target.value = ''
    }
  }

  // ── Nombre ────────────────────────────────────────────────────
  const handleSaveNombre = async () => {
    if (!nuevoNombre.trim() || nuevoNombre.trim() === perfil?.nombre) return
    setNombreLoading(true)
    setNombreMsg(null)
    try {
      const updated = await usuarioService.updateNombre(nuevoNombre.trim())
      setPerfil((p) => p ? { ...p, nombre: updated.nombre } : p)
      updateUsuario({ nombre: updated.nombre })
      setNombreMsg({ tipo: 'ok', texto: 'Nombre actualizado' })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setNombreMsg({ tipo: 'err', texto: e.response?.data?.error ?? 'Error al actualizar' })
    } finally {
      setNombreLoading(false)
    }
  }

  // ── Email ─────────────────────────────────────────────────────
  const handleSaveEmail = async () => {
    if (!nuevoEmail.trim() || nuevoEmail.trim() === perfil?.email) return
    if (!validateEmail(nuevoEmail.trim())) {
      setEmailMsg({ tipo: 'err', texto: 'Email no válido' })
      return
    }
    setEmailLoading(true)
    setEmailMsg(null)
    try {
      const updated = await usuarioService.updateEmail(nuevoEmail.trim())
      setPerfil((p) => p ? { ...p, email: updated.email } : p)
      setEmailMsg({ tipo: 'ok', texto: 'Email actualizado' })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setEmailMsg({ tipo: 'err', texto: e.response?.data?.error ?? 'Error al actualizar' })
    } finally {
      setEmailLoading(false)
    }
  }

  // ── Contraseña ────────────────────────────────────────────────
  const validatePassForm = (): boolean => {
    const errs: Record<string, string> = {}
    if (!currentPassword) errs.current = 'Introduce la contraseña actual'
    if (!newPassword) errs.new = 'Introduce la nueva contraseña'
    else if (!validatePassword(newPassword)) errs.new = 'Mínimo 6 caracteres'
    if (!confirmNewPassword) errs.confirm = 'Confirma la nueva contraseña'
    else if (newPassword !== confirmNewPassword) errs.confirm = 'Las contraseñas no coinciden'
    setPassErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChangePassword = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setPassMsg(null)
    if (!validatePassForm()) return
    setPassLoading(true)
    try {
      await usuarioService.updatePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setPassErrors({})
      setPassMsg({ tipo: 'ok', texto: 'Contraseña actualizada correctamente' })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setPassMsg({ tipo: 'err', texto: e.response?.data?.error ?? 'Error al cambiar contraseña' })
    } finally {
      setPassLoading(false)
    }
  }

  // Personajes agrupados por sistema
  const personajesPorSistema = (perfil?.personajes ?? []).reduce<
    Record<string, PerfilData['personajes']>
  >((acc, p) => {
    const key = p.sistema_rol?.nombre ?? 'Sin sistema'
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  const avatarSrc = perfil?.avatar_url ?? usuario?.avatar_url ?? null
  const initials = (perfil?.nombre ?? usuario?.nombre ?? '?').slice(0, 2).toUpperCase()

  if (loadingPerfil) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm animate-pulse">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto">

      {/* ── Avatar ── */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-border">
            <AvatarImage src={avatarSrc ?? undefined} alt={perfil?.nombre} />
            <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarLoading}
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors disabled:opacity-50"
            title="Cambiar avatar"
          >
            {avatarLoading
              ? <span className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Camera className="h-3.5 w-3.5 text-white" />
            }
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <p className="text-lg font-semibold">{perfil?.nombre}</p>
        <FeedbackMsg msg={avatarMsg} />
      </div>

      {/* ── Información ── */}
      <Card className="w-full border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Información</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Editar nombre y email */}
            <div className="flex flex-col gap-5 sm:border-r sm:border-border sm:pr-6">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <Pencil className="h-3 w-3" /> Cambiar Nombre
                </Label>
                <Input
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="border-fuchsia-500/60 bg-fuchsia-500/5 focus-visible:ring-fuchsia-500/50"
                  placeholder="Tu nombre"
                />
                <Button
                  size="sm"
                  onClick={handleSaveNombre}
                  disabled={nombreLoading || !nuevoNombre.trim() || nuevoNombre.trim() === perfil?.nombre}
                  className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
                >
                  {nombreLoading ? 'Guardando...' : 'Guardar nombre'}
                </Button>
                <FeedbackMsg msg={nombreMsg} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <Pencil className="h-3 w-3" /> Cambiar Email
                </Label>
                <Input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  className="border-fuchsia-500/60 bg-fuchsia-500/5 focus-visible:ring-fuchsia-500/50"
                  placeholder="tu@email.com"
                />
                <Button
                  size="sm"
                  onClick={handleSaveEmail}
                  disabled={emailLoading || !nuevoEmail.trim() || nuevoEmail.trim() === perfil?.email}
                  className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
                >
                  {emailLoading ? 'Guardando...' : 'Guardar email'}
                </Button>
                <FeedbackMsg msg={emailMsg} />
              </div>
            </div>

            {/* Info de cuenta */}
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Información de Cuenta
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre</span>
                  <span className="font-medium">{perfil?.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium truncate max-w-[160px]">{perfil?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Miembro desde</span>
                  <span className="font-medium">
                    {perfil?.created_at ? formatDate(perfil.created_at) : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Personajes</span>
                  <span className="font-medium">{perfil?.personajes.length ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Lista de Personajes ── */}
      <Card className="w-full border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Lista Personajes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {Object.keys(personajesPorSistema).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no has creado ningún personaje.
            </p>
          ) : (
            Object.entries(personajesPorSistema).map(([sistema, pjs]) => (
              <div key={sistema} className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{sistema}</p>
                <div className="flex flex-wrap gap-2">
                  {pjs.map((p) => (
                    <button
                      key={p.id_personaje}
                      onClick={() => navigate(ROUTES.PRIVATE.PERSONAJE_EDITAR.replace(':id', String(p.id_personaje)))}
                      className="px-3 py-1.5 rounded-md border border-border bg-secondary text-sm font-medium hover:border-primary/60 hover:bg-secondary/80 transition-all"
                    >
                      {p.nombre}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ── Cambiar contraseña ── */}
      <Card className="w-full border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cambiar Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} noValidate className="flex flex-col gap-4 max-w-sm">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPass" className="text-xs uppercase tracking-wide text-muted-foreground">Contraseña actual</Label>
              <Input
                id="currentPass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className={passErrors.current ? 'border-destructive' : ''}
              />
              {passErrors.current && <span className="text-xs text-destructive">{passErrors.current}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPass" className="text-xs uppercase tracking-wide text-muted-foreground">Nueva contraseña</Label>
              <Input
                id="newPass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className={passErrors.new ? 'border-destructive' : ''}
              />
              {passErrors.new && <span className="text-xs text-destructive">{passErrors.new}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPass" className="text-xs uppercase tracking-wide text-muted-foreground">Confirmar nueva contraseña</Label>
              <Input
                id="confirmPass"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="new-password"
                className={passErrors.confirm ? 'border-destructive' : ''}
              />
              {passErrors.confirm && <span className="text-xs text-destructive">{passErrors.confirm}</span>}
            </div>

            <FeedbackMsg msg={passMsg} />

            <Button type="submit" disabled={passLoading} className="w-full">
              {passLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
