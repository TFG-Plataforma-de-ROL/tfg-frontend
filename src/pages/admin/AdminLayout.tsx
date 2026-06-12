import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Layers, BookOpen, Swords, Users } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import Header from '@/components/Header'

const navItems = [
  { to: ROUTES.ADMIN.DASHBOARD,    label: 'Panel',          icon: LayoutDashboard, end: true  },
  { to: ROUTES.ADMIN.USUARIOS,     label: 'Usuarios',       icon: Users,           end: false },
  { to: ROUTES.ADMIN.SISTEMAS_ROL, label: 'Sistemas de Rol',icon: Layers,          end: false },
  { to: ROUTES.ADMIN.PLANTILLAS,   label: 'Plantillas',     icon: BookOpen,        end: false },
  { to: ROUTES.ADMIN.ITEMS,        label: 'Items',          icon: Swords,          end: false },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <aside className="w-56 shrink-0 border-r border-border/60 bg-card py-6 px-3 flex flex-col gap-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground px-3 mb-3 font-semibold">
            Administración
          </p>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </aside>

        <main className="flex-1 px-8 py-8 max-w-5xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
