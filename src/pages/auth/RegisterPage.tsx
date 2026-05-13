import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { validateEmail, validatePassword } from '../../utils/helpers';
import { ROUTES } from '../../config/routes';
import './auth.css';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    nombre?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState('');

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!nombre.trim()) next.nombre = 'El nombre es obligatorio';
    if (!email) next.email = 'El email es obligatorio';
    else if (!validateEmail(email)) next.email = 'Email no válido';
    if (!password) next.password = 'La contraseña es obligatoria';
    else if (!validatePassword(password)) next.password = 'Mínimo 6 caracteres';
    if (!confirmPassword) next.confirmPassword = 'Confirma tu contraseña';
    else if (password !== confirmPassword) next.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      await register(nombre.trim(), email, password);
      navigate(ROUTES.PRIVATE.DASHBOARD);
    } catch (err: any) {
      setServerError(err.response?.data?.error || err.response?.data?.message || 'Error al registrarse');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>⚔️ Gestor de Rol</h1>
          <p>Tu compañero de aventuras</p>
        </div>

        <h2 className="auth-title">Crear cuenta</h2>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {serverError && <div className="auth-error">{serverError}</div>}

          <div className="form-group">
            <label htmlFor="nombre">Nombre de aventurero</label>
            <input
              id="nombre"
              type="text"
              placeholder="Gandalf el Gris"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={errors.nombre ? 'input-error' : ''}
              autoComplete="name"
            />
            {errors.nombre && <span className="field-error">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'input-error' : ''}
              autoComplete="new-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={errors.confirmPassword ? 'input-error' : ''}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta?
          <Link to={ROUTES.PUBLIC.LOGIN}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
