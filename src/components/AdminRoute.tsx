import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { ROUTES } from '@/config/routes'

interface Props {
  children: React.ReactNode
}

export default function AdminRoute({ children }: Props) {
  const { usuario, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0c29' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Cargando...</p>
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />
  }

  if (!usuario.is_admin) {
    return <Navigate to={ROUTES.PRIVATE.DASHBOARD} replace />
  }

  return <>{children}</>
}
