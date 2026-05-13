import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { validateEmail } from '../../utils/helpers';
import { ROUTES } from '../../config/routes';
import './auth.css';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!email) next.email = 'El email es obligatorio';
    else if (!validateEmail(email)) next.email = 'Email no válido';
    if (!password) next.password = 'La contraseña es obligatoria';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      await login(email, password);
      navigate(ROUTES.PRIVATE.DASHBOARD);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>⚔️ Gestor de Rol</h1>
          <p>Tu compañero de aventuras</p>
        </div>

        <h2 className="auth-title">Iniciar sesión</h2>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {serverError && <div className="auth-error">{serverError}</div>}

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
              autoComplete="current-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta?
          <Link to={ROUTES.PUBLIC.REGISTER}>Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
