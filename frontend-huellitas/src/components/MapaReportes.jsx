import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { API } from '../config';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

function CapturarClic({ onClick, activo }) {
  useMapEvents({
    click(e) { if (activo) onClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

function AjustarMapa({ cuando }) {
  const map = useMap();
  useEffect(() => {
    const run = () => map.invalidateSize({ animate: false });
    const t = setTimeout(run, 100);
    const t2 = setTimeout(run, 400);
    window.addEventListener('resize', run);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      window.removeEventListener('resize', run);
    };
  }, [map, cuando]);
  return null;
}

function CentrarEnUsuario({ ubicacion, reportes, ignorarSiBorrador }) {
  const map = useMap();
  useEffect(() => {
    if (ignorarSiBorrador || !ubicacion?.lat) return;
    const puntos = [[ubicacion.lat, ubicacion.lng]];
    reportes.forEach((m) => {
      if (m.latitud) puntos.push([m.latitud, m.longitud]);
    });
    if (puntos.length === 1) {
      map.setView(puntos[0], 14);
    } else {
      map.fitBounds(puntos, { padding: [48, 48], maxZoom: 15 });
    }
  }, [map, ubicacion?.lat, ubicacion?.lng, reportes.length, ignorarSiBorrador]);
  return null;
}

function CentrarEnBorrador({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat == null || lng == null || lat === '' || lng === '') return;
    map.flyTo([Number(lat), Number(lng)], 16, { duration: 0.6 });
  }, [map, lat, lng]);
  return null;
}

const iconPerdida = new L.DivIcon({
  className: 'marker-perdida',
  html: '<div class="pin pin-perdida">🐾</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const iconAvistamiento = new L.DivIcon({
  className: 'marker-avistamiento',
  html: '<div class="pin pin-vi">👀</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const iconUsuario = new L.DivIcon({
  className: 'marker-usuario-wrap',
  html: '<div class="marker-usuario"><span class="marker-usuario-pulse"></span><span class="marker-usuario-dot"></span></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function crearIconoBorrador(tipoReporte) {
  const esAvistamiento = tipoReporte === 'avistamiento';
  const clase = esAvistamiento ? 'pin-borrador-avistamiento' : 'pin-borrador-perdida';
  const icono = esAvistamiento ? '👀' : '📍';
  const texto = esAvistamiento ? 'Avistamiento aquí' : 'Tu reporte aquí';
  return new L.DivIcon({
    className: 'marker-borrador-wrap',
    html: `<div class="pin-borrador ${clase}"><span class="pin-borrador-pulse"></span><span class="pin-borrador-icon">${icono}</span><span class="pin-borrador-label">${texto}</span></div>`,
    iconSize: [120, 72],
    iconAnchor: [60, 68],
  });
}

export default function MapaReportes({
  reportes,
  token,
  vistaActiva,
  reporteSeleccionado,
  ubicacionUsuario,
  radioKm,
  onMapClick,
  onSelect,
  onDetalle,
  onContactar,
  onEncontrado,
  onEditar,
  onEliminar,
  onDenunciar,
  esMiReporte,
  modoInvitado = false,
  puntoBorrador = null,
}) {
  const activo = !!token && vistaActiva === 'reportar';
  const borradorLat = puntoBorrador?.lat ?? puntoBorrador?.latitud;
  const borradorLng = puntoBorrador?.lng ?? puntoBorrador?.longitud;
  const tieneBorrador = borradorLat != null && borradorLng != null && borradorLat !== '' && borradorLng !== '';
  const tipoBorrador = puntoBorrador?.tipoReporte || 'perdida';

  const centro = tieneBorrador
    ? [Number(borradorLat), Number(borradorLng)]
    : ubicacionUsuario
      ? [ubicacionUsuario.lat, ubicacionUsuario.lng]
      : [-33.4489, -70.6693];

  const zoomInicial = tieneBorrador ? 16 : ubicacionUsuario ? 14 : 13;

  return (
    <div className={`map-wrap ${activo ? 'map-wrap-colocando' : ''}`}>
      {activo && (
        <div className={`map-borrador-banner ${tieneBorrador ? 'map-borrador-banner-ok' : ''}`}>
          {tieneBorrador ? (
            <>
              <span className="map-borrador-banner-icon">📍</span>
              <span>
                <strong>Punto marcado</strong>
                {puntoBorrador?.ubicacionNombre && ` · ${puntoBorrador.ubicacionNombre}`}
                {puntoBorrador?.nombre && ` (${puntoBorrador.nombre})`}
              </span>
              <small>Haz clic de nuevo para moverlo</small>
            </>
          ) : (
            <>
              <span className="map-borrador-banner-icon">👆</span>
              <span><strong>Haz clic en el mapa</strong> para colocar el pin de tu reporte</span>
            </>
          )}
        </div>
      )}
      {ubicacionUsuario && !activo && (
        <div className="map-ubicacion-badge">
          📍 Estás aquí · radio {radioKm} km
        </div>
      )}
      <MapContainer
        center={centro}
        zoom={zoomInicial}
        style={{ height: '100%', width: '100%', minHeight: 450 }}
        scrollWheelZoom
      >
        <AjustarMapa cuando={`${vistaActiva}-${ubicacionUsuario?.lat || ''}-${borradorLat || ''}`} />
        {ubicacionUsuario && (
          <CentrarEnUsuario
            ubicacion={ubicacionUsuario}
            reportes={reportes}
            ignorarSiBorrador={activo && tieneBorrador}
          />
        )}
        {activo && tieneBorrador && (
          <CentrarEnBorrador lat={borradorLat} lng={borradorLng} />
        )}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {ubicacionUsuario && (
          <>
            <Marker position={[ubicacionUsuario.lat, ubicacionUsuario.lng]} icon={iconUsuario}>
              <Popup>
                <strong>Tu ubicación</strong>
                <br />
                <small>Radio de búsqueda: {radioKm} km</small>
              </Popup>
            </Marker>
            <Circle
              center={[ubicacionUsuario.lat, ubicacionUsuario.lng]}
              radius={radioKm * 1000}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.12,
                weight: 2,
              }}
            />
          </>
        )}
        <CapturarClic activo={activo} onClick={onMapClick} />
        {activo && tieneBorrador && (
          <>
            <Circle
              center={[Number(borradorLat), Number(borradorLng)]}
              radius={150}
              pathOptions={{
                color: tipoBorrador === 'avistamiento' ? '#0d9488' : '#ff6b4a',
                fillColor: tipoBorrador === 'avistamiento' ? '#0d9488' : '#ff6b4a',
                fillOpacity: 0.18,
                weight: 3,
                dashArray: '8 6',
              }}
            />
            <Marker
              position={[Number(borradorLat), Number(borradorLng)]}
              icon={crearIconoBorrador(tipoBorrador)}
              zIndexOffset={1000}
            >
              <Popup>
                <strong>Vista previa del reporte</strong>
                <br />
                {puntoBorrador?.nombre && <span>{puntoBorrador.nombre}<br /></span>}
                <small>{puntoBorrador?.ubicacionNombre || 'Ubicación marcada'}</small>
                <br />
                <small>{Number(borradorLat).toFixed(5)}, {Number(borradorLng).toFixed(5)}</small>
              </Popup>
            </Marker>
          </>
        )}
        <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
          {reportes.filter((m) => m.latitud).map((m) => (
            <Marker
              key={m._id}
              position={[m.latitud, m.longitud]}
              icon={m.tipoReporte === 'avistamiento' ? iconAvistamiento : iconPerdida}
              eventHandlers={{ click: () => onSelect(m._id) }}
            >
              <Popup>
                <div className="popup-content">
                  {m.fotoUrl && <img src={`${API}${m.fotoUrl}`} alt={m.nombre} />}
                  <strong>{m.nombre}</strong>
                  {m.distanciaKm != null && (
                    <span className="feed-distancia" style={{ marginLeft: 6 }}>{m.distanciaKm} km</span>
                  )}
                  <br />
                  <span className={`status-badge status-${m.estado || 'extraviado'}`}>
                    {m.estado === 'encontrado' ? 'Encontrado' : m.tipoReporte === 'avistamiento' ? 'Avistamiento' : 'Extraviado'}
                  </span>
                  {m.recompensa > 0 && <p className="recompensa-tag">💰 ${m.recompensa?.toLocaleString('es-CL')}</p>}
                  <p style={{ fontSize: 13 }}>{m.descripcion?.slice(0, 80)}…</p>
                  <small>📍 {m.ubicacionNombre}</small>
                  <div className="popup-actions">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => onDetalle(m)}>Ver ficha</button>
                    {modoInvitado && (
                      <button type="button" className="btn btn-sm btn-primary" onClick={() => onContactar(m)}>Iniciar sesión</button>
                    )}
                    {token && m.creador && !esMiReporte(m) && (
                      <button type="button" className="btn btn-sm btn-teal" onClick={() => onContactar(m)}>Contactar</button>
                    )}
                    {token && esMiReporte(m) && (
                      <>
                        {m.estado !== 'encontrado' && (
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => onEncontrado(m._id)}>✅ Encontrado</button>
                        )}
                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => onEditar(m)}>✏️</button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => onEliminar(m._id)}>🗑️</button>
                      </>
                    )}
                    {token && !esMiReporte(m) && (
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => onDenunciar(m._id)}>⚠️</button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
