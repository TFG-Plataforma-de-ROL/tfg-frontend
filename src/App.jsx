import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState({ message: 'Conectando...' })
  const [personajes, setPersonajes] = useState([])

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data))
      .catch(() => setBackendStatus({ message: 'Backend no conectado' }))

    fetch('/api/personajes', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => Array.isArray(data) ? setPersonajes(data) : null)
      .catch(() => {})
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Gestor de Personajes de Rol</h1>

      <div style={{ marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #2196f3' }}>
        <p><strong>Backend:</strong> {backendStatus.message}</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Mis Personajes</h2>
        {personajes.length === 0
          ? <p style={{ color: '#888' }}>No hay personajes. Inicia sesión para ver los tuyos.</p>
          : (
            <ul>
              {personajes.map(p => (
                <li key={p.id_personaje}>
                  <strong>{p.nombre}</strong> — {p.sistema_rol?.nombre}
                  {p.descripcion && `: ${p.descripcion}`}
                </li>
              ))}
            </ul>
          )
        }
      </div>
    </div>
  )
}

export default App
