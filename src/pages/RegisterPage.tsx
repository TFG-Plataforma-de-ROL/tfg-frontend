import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const s = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' } as const,
  card: { background: '#fff', borderRadius: 8, padding: '2rem', width: '100%', maxWidth: 380, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' } as const,
  title: { margin: '0 0 1.5rem', fontSize: '1.5rem', textAlign: 'center' as const },
  field: { marginBottom: '1rem' } as const,
  label: { display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 } as const,
  input: { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '1rem', boxSizing: 'border-box' as const },
  btn: { width: '100%', padding: '0.625rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' } as const,
  err: { background: '#fde8e8', color: '#c62828', borderRadius: 4, padding: '0.5rem 0.75rem', marginBottom: '1rem', fontSize: '0.875rem' } as const,
  link: { textAlign: 'center' as const, marginTop: '1rem', fontSize: '0.875rem' },
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(nombre, email, password);
      navigate('/personajes');
    } catch {
      setError('Error al registrarse. Puede que el email ya esté en uso.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <h1 style={s.title}>Crear cuenta</h1>
        {error && <div style={s.err}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Nombre</label>
            <input style={s.input} type="text" value={nombre} onChange={e => setNombre(e.target.value)} required autoFocus />
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Contraseña</label>
            <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Registrando…' : 'Registrarse'}
          </button>
        </form>
        <p style={s.link}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
