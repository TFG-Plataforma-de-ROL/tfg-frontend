import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import { usuarioService } from '../../services/usuarioService';
import { formatDate, validatePassword } from '../../utils/helpers';
import './profile.css';

interface PerfilData {
  id_usuario: number;
  nombre: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  personajes: Array<{
    id_personaje: number;
    nombre: string;
    descripcion: string | null;
    sistema_rol: { nombre: string } | null;
  }>;
}

export default function ProfilePage() {
  const { usuario, login } = useAuth();

  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(true);

  // Editar nombre
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nombreLoading, setNombreLoading] = useState(false);
  const [nombreMsg, setNombreMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null);

  // Cambiar contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passErrors, setPassErrors] = useState<Record<string, string>>({});
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null);

  useEffect(() => {
    usuarioService.getMe()
      .then((data) => setPerfil(data))
      .catch(() => {})
      .finally(() => setLoadingPerfil(false));
  }, []);

  // ── Editar nombre ──────────────────────────────────────────────
  const handleStartEditNombre = () => {
    setNuevoNombre(perfil?.nombre ?? '');
    setNombreMsg(null);
    setEditandoNombre(true);
  };

  const handleSaveNombre = async () => {
    if (!nuevoNombre.trim()) return;
    setNombreLoading(true);
    setNombreMsg(null);
    try {
      const updated = await usuarioService.updateNombre(nuevoNombre.trim());
      setPerfil((p) => p ? { ...p, nombre: updated.nombre } : p);
      setEditandoNombre(false);
      setNombreMsg({ tipo: 'ok', texto: 'Nombre actualizado' });
    } catch (err: any) {
      setNombreMsg({ tipo: 'err', texto: err.response?.data?.error ?? 'Error al actualizar' });
    } finally {
      setNombreLoading(false);
    }
  };

  // ── Cambiar contraseña ─────────────────────────────────────────
  const validatePassForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.current = 'Introduce la contraseña actual';
    if (!newPassword) errs.new = 'Introduce la nueva contraseña';
    else if (!validatePassword(newPassword)) errs.new = 'Mínimo 6 caracteres';
    if (!confirmNewPassword) errs.confirm = 'Confirma la nueva contraseña';
    else if (newPassword !== confirmNewPassword) errs.confirm = 'Las contraseñas no coinciden';
    setPassErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setPassMsg(null);
    if (!validatePassForm()) return;
    setPassLoading(true);
    try {
      await usuarioService.updatePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPassErrors({});
      setPassMsg({ tipo: 'ok', texto: 'Contraseña actualizada correctamente' });
    } catch (err: any) {
      setPassMsg({ tipo: 'err', texto: err.response?.data?.error ?? 'Error al cambiar contraseña' });
    } finally {
      setPassLoading(false);
    }
  };

  if (loadingPerfil) {
    return <p style={{ color: 'rgba(255,255,255,0.4)' }}>Cargando perfil...</p>;
  }

  return (
    <div className="profile-page">
      <h2>Mi perfil</h2>

      {/* ── Información de cuenta ── */}
      <div className="profile-card">
        <h3>Información de cuenta</h3>

        <div className="info-row">
          <span className="info-label">Nombre</span>
          <span className="info-value">{perfil?.nombre}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email</span>
          <span className="info-value">{perfil?.email}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Miembro desde</span>
          <span className="info-value">
            {perfil?.created_at ? formatDate(perfil.created_at) : '—'}
          </span>
        </div>

        {!editandoNombre ? (
          <div style={{ marginTop: '1rem' }}>
            <button className="btn-ghost" onClick={handleStartEditNombre}>
              Cambiar nombre
            </button>
            {nombreMsg && (
              <p className={nombreMsg.tipo === 'ok' ? 'msg-success' : 'msg-error'}>
                {nombreMsg.texto}
              </p>
            )}
          </div>
        ) : (
          <div className="edit-nombre">
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nuevo nombre"
              autoFocus
            />
            <button className="btn-primary" onClick={handleSaveNombre} disabled={nombreLoading}>
              {nombreLoading ? 'Guardando...' : 'Guardar'}
            </button>
            <button className="btn-ghost" onClick={() => setEditandoNombre(false)}>
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* ── Cambiar contraseña ── */}
      <div className="profile-card">
        <h3>Cambiar contraseña</h3>
        <form className="password-form" onSubmit={handleChangePassword} noValidate>
          <div className="form-group">
            <label>Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={passErrors.current ? 'input-error' : ''}
              autoComplete="current-password"
            />
            {passErrors.current && <span className="msg-error">{passErrors.current}</span>}
          </div>
          <div className="form-group">
            <label>Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={passErrors.new ? 'input-error' : ''}
              autoComplete="new-password"
            />
            {passErrors.new && <span className="msg-error">{passErrors.new}</span>}
          </div>
          <div className="form-group">
            <label>Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={passErrors.confirm ? 'input-error' : ''}
              autoComplete="new-password"
            />
            {passErrors.confirm && <span className="msg-error">{passErrors.confirm}</span>}
          </div>

          {passMsg && (
            <p className={passMsg.tipo === 'ok' ? 'msg-success' : 'msg-error'}>
              {passMsg.texto}
            </p>
          )}

          <div>
            <button type="submit" className="btn-primary" disabled={passLoading}>
              {passLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Personajes ── */}
      <div className="profile-card">
        <h3>Mis personajes ({perfil?.personajes.length ?? 0})</h3>
        {perfil?.personajes.length === 0 ? (
          <p className="empty-state">Todavía no has creado ningún personaje.</p>
        ) : (
          <div className="personaje-list">
            {perfil?.personajes.map((p) => (
              <div key={p.id_personaje} className="personaje-item">
                <span className="personaje-nombre">{p.nombre}</span>
                {p.sistema_rol && (
                  <span className="personaje-sistema">{p.sistema_rol.nombre}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
