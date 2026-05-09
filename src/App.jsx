import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PersonajesPage from './pages/PersonajesPage';
import NuevoPersonajePage from './pages/NuevoPersonajePage';
import BuilderPage from './pages/BuilderPage';
import SistemasRolPage from './pages/admin/SistemasRolPage';
import PlantillasPage from './pages/admin/PlantillasPage';
import CamposPage from './pages/admin/CamposPage';
import ItemsPage from './pages/admin/ItemsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Privadas (usuario autenticado) */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Navigate to="/personajes" replace />} />
            <Route path="/personajes" element={<PersonajesPage />} />
            <Route path="/personajes/nuevo" element={<NuevoPersonajePage />} />
            <Route path="/personajes/:personajeId/builder" element={<BuilderPage />} />
          </Route>

          {/* Admin (usuario autenticado + is_admin) */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Navigate to="/admin/sistemas-rol" replace />} />
            <Route path="/admin/sistemas-rol" element={<SistemasRolPage />} />
            <Route path="/admin/plantillas" element={<PlantillasPage />} />
            <Route path="/admin/plantillas/:plantillaId/campos" element={<CamposPage />} />
            <Route path="/admin/items" element={<ItemsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
