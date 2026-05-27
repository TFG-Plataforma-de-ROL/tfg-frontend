import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks'
import { ROUTES } from '@/config/routes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import logo3 from '@/assets/logo3.png'

export default function Header() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.PUBLIC.LOGIN)
  }

  const initials = usuario?.nombre?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 bg-card border-b border-border/60">
      <button
        onClick={() => navigate(ROUTES.PRIVATE.DASHBOARD)}
        className="select-none"
      >
        <img src={logo3} alt="Logo" className="h-24 object-contain" />
      </button>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.PRIVATE.PROFILE)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
        >
          {usuario?.nombre}
        </button>

        <button
          onClick={() => navigate(ROUTES.PRIVATE.PROFILE)}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title={`Perfil de ${usuario?.nombre}`}
        >
          <Avatar className="h-9 w-9 border border-border/60 hover:border-primary/60 transition-colors">
            <AvatarImage src={usuario?.avatar_url ?? undefined} alt={usuario?.nombre} />
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </Button>
      </div>
    </header>
  )
}
