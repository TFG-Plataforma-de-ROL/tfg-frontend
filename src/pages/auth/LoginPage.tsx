import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks'
import { validateEmail } from '@/utils/helpers'
import { ROUTES } from '@/config/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_NAME } from '@/utils/constants'

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [serverError, setServerError] = useState('')

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (!email) next.email = 'El email es obligatorio'
    else if (!validateEmail(email)) next.email = 'Email no válido'
    if (!password) next.password = 'La contraseña es obligatoria'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    try {
      await login(email, password)
      navigate(ROUTES.PRIVATE.DASHBOARD)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } }
      setServerError(
        axiosErr.response?.data?.error ??
        axiosErr.response?.data?.message ??
        'Credenciales incorrectas'
      )
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <span className="mb-6 text-sm font-semibold tracking-widest text-primary uppercase">
        {APP_NAME}
      </span>

      <Card className="w-full max-w-sm rounded-2xl border-border/50 shadow-xl">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Iniciar Sesión</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 mt-2">
            {serverError && (
              <div className="rounded-md bg-destructive/15 border border-destructive/40 px-4 py-2.5 text-sm text-destructive text-center">
                {serverError}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Usuario / Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.email && (
                <span className="text-xs text-destructive">{errors.email}</span>
              )}
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={`pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-destructive">{errors.password}</span>
              )}
            </div>

            {/* ¿Olvidaste la contraseña? */}
            <div className="text-right -mt-1">
              <span className="text-xs text-muted-foreground cursor-default">
                ¿Olvidaste la contraseña?
              </span>
            </div>

            <Button type="submit" className="w-full mt-1" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Iniciar Sesión'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿Eres nuevo?{' '}
              <Link
                to={ROUTES.PUBLIC.REGISTER}
                className="text-primary font-semibold hover:underline"
              >
                Regístrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
