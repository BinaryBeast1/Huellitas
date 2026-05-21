import { API } from '../config';

export default function FeedCercanos({
  items,
  cargando,
  errorGeo,
  sinUbicacion,
  onActualizarUbicacion,
  onSeleccionar,
  seleccionadoId,
  onVerDetalle,
}) {
  if (sinUbicacion) {
    return (
      <div className="feed-cercanos feed-empty">
        <p>📍 Activa tu ubicación para ver mascotas perdidas o encontradas cerca de ti.</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={onActualizarUbicacion}>
          Usar mi ubicación
        </button>
        {errorGeo && <p className="form-hint" style={{ color: 'var(--danger)' }}>{errorGeo}</p>}
      </div>
    );
  }

  if (cargando && items.length === 0) {
    return <p className="feed-cercanos feed-loading">Obteniendo tu ubicación…</p>;
  }

  return (
    <div className="feed-cercanos">
      <div className="feed-cercanos-header">
        <span>{items.length} cerca de ti</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onActualizarUbicacion} title="Actualizar ubicación">
          📍
        </button>
      </div>
      {items.length === 0 ? (
        <p className="notif-empty">No hay reportes en este radio. Prueba ampliar el rango.</p>
      ) : (
        <div className="feed-cercanos-list">
          {items.map((m) => (
            <article
              key={m._id}
              className={`feed-item ${seleccionadoId === m._id ? 'selected' : ''}`}
              onClick={() => { onSeleccionar(m._id); onVerDetalle(m); }}
            >
              {m.fotoUrl ? (
                <img src={`${API}${m.fotoUrl}`} alt="" className="feed-item-img" />
              ) : (
                <div className="feed-item-img feed-item-placeholder">🐾</div>
              )}
              <div className="feed-item-body">
                <div className="feed-item-top">
                  <strong>{m.nombre}</strong>
                  <span className="feed-distancia">{m.distanciaKm} km</span>
                </div>
                <small>{m.especie}{m.raza ? ` · ${m.raza}` : ''}</small>
                <small className="feed-lugar">📍 {m.ubicacionNombre}</small>
                <span className={`status-badge status-${m.estado || 'extraviado'}`}>
                  {m.estado === 'encontrado' ? 'Encontrado' : m.tipoReporte === 'avistamiento' ? 'Avistamiento' : 'Extraviado'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
