import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import CharacterPage from '@/pages/character/CharacterPage'
import Layout from '@/components/Layout'
import LayoutFull from '@/components/LayoutFull'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminRoute from '@/components/AdminRoute'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import SistemasRolPage from '@/pages/admin/SistemasRolPage'
import PlantillasPage from '@/pages/admin/PlantillasPage'
import ItemsPage from '@/pages/admin/ItemsPage'
import UsuariosPage from '@/pages/admin/UsuariosPage'

function App() {
  return (
    <Routes>
      <Route path={ROUTES.PUBLIC.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.PUBLIC.REGISTER} element={<RegisterPage />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path={ROUTES.PRIVATE.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.PRIVATE.PROFILE} element={<ProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute><LayoutFull /></ProtectedRoute>}>
        <Route path={ROUTES.PRIVATE.PERSONAJE_NUEVO} element={<CharacterPage />} />
        <Route path={ROUTES.PRIVATE.PERSONAJE_EDITAR} element={<CharacterPage />} />
      </Route>

      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN.SISTEMAS_ROL} element={<SistemasRolPage />} />
        <Route path={ROUTES.ADMIN.PLANTILLAS} element={<PlantillasPage />} />
        <Route path={ROUTES.ADMIN.ITEMS} element={<ItemsPage />} />
        <Route path={ROUTES.ADMIN.USUARIOS} element={<UsuariosPage />} />
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.PUBLIC.LOGIN} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.PUBLIC.LOGIN} replace />} />
    </Routes>
  )
}

export default App
