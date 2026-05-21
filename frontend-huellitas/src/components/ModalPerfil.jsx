export default function ModalPerfil({ perfilEdit, setPerfilEdit, onSubmit, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>×</button>
        <div className="profile-avatar">👤</div>
        <h3>Editar perfil</h3>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" required value={perfilEdit.nombre}
              onChange={(e) => setPerfilEdit({ ...perfilEdit, nombre: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={perfilEdit.email}
              onChange={(e) => setPerfilEdit({ ...perfilEdit, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input type="tel" value={perfilEdit.telefono || ''}
              onChange={(e) => setPerfilEdit({ ...perfilEdit, telefono: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={!!perfilEdit.mostrarContacto}
                onChange={(e) => setPerfilEdit({ ...perfilEdit, mostrarContacto: e.target.checked })} />
              Mostrar email/teléfono en contacto directo
            </label>
          </div>
          <div className="form-group">
            <label>Alertas en mi zona — radio (km)</label>
            <input type="number" min="1" max="50" value={perfilEdit.alertRadiusKm ?? 5}
              onChange={(e) => setPerfilEdit({ ...perfilEdit, alertRadiusKm: Number(e.target.value) })} />
            <p className="form-hint">Usa el mapa en modo reporte y guarda tu ubicación de alerta con lat/lng en perfil (opcional).</p>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Lat alerta</label>
              <input type="number" step="any" value={perfilEdit.alertLat ?? ''}
                onChange={(e) => setPerfilEdit({ ...perfilEdit, alertLat: e.target.value ? Number(e.target.value) : '' })} />
            </div>
            <div className="form-group">
              <label>Lng alerta</label>
              <input type="number" step="any" value={perfilEdit.alertLng ?? ''}
                onChange={(e) => setPerfilEdit({ ...perfilEdit, alertLng: e.target.value ? Number(e.target.value) : '' })} />
            </div>
          </div>
          <div className="form-group">
            <label>Nueva contraseña (opcional)</label>
            <input type="password" value={perfilEdit.password || ''}
              onChange={(e) => setPerfilEdit({ ...perfilEdit, password: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Guardar</button>
        </form>
      </div>
    </div>
  );
}
