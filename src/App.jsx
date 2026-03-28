import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState({ message: 'Conectando...', database: 'Desconectado' })
  const [tareas, setTareas] = useState([])
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data))
      .catch(() => setBackendStatus({ message: 'Backend no conectado', database: 'Desconectado' }))
    
    fetch('/api/tareas')
      .then(res => res.json())
      .then(data => setTareas(data))
      .catch(err => console.error('Error cargando tareas:', err))

    fetch('/api/usuarios')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error('Error cargando usuarios:', err))
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Proyecto TFG</h1>
      
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #2196f3' }}>
        <p><strong>Backend:</strong> {backendStatus.message}</p>
        <p><strong>Base de datos:</strong> {backendStatus.database}</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Usuarios</h2>
        <ul>
          {usuarios.map(user => (
            <li key={user.id}>{user.nombre} ({user.email})</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Tareas</h2>
        <ul>
          {tareas.map(tarea => (
            <li key={tarea.id}>
              <strong>{tarea.titulo}</strong>: {tarea.descripcion} 
              {tarea.completado && ' ✓'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
