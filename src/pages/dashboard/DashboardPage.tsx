import { useAuth } from '../../hooks';

export default function DashboardPage() {
  const { usuario } = useAuth();

  return (
    <div>
      <h2 style={{ color: '#fff', margin: '0 0 1rem' }}>Inicio</h2>
      <p style={{ color: 'rgba(255,255,255,0.6)' }}>
        Bienvenido, <strong style={{ color: '#c9a84c' }}>{usuario?.nombre}</strong>.
        El dashboard está en construcción.
      </p>
    </div>
  );
}
