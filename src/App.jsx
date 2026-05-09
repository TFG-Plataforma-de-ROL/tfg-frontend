import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PersonajesPage from './pages/PersonajesPage';
import NuevoPersonajePage from './pages/NuevoPersonajePage';
import BuilderPage from './pages/BuilderPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Navigate to="/personajes" replace />} />
            <Route path="/personajes" element={<PersonajesPage />} />
            <Route path="/personajes/nuevo" element={<NuevoPersonajePage />} />
            <Route path="/personajes/:personajeId/builder" element={<BuilderPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
