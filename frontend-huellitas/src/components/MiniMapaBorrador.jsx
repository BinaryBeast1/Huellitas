import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function CentrarBorrador({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], 16, { animate: true });
    }
  }, [map, lat, lng]);
  return null;
}

const iconBorradorMini = new L.DivIcon({
  className: 'marker-borrador-wrap',
  html: '<div class="pin-borrador pin-borrador-mini"><span class="pin-borrador-icon">📍</span><span class="pin-borrador-label">Aquí</span></div>',
  iconSize: [56, 56],
  iconAnchor: [28, 52],
});

export default function MiniMapaBorrador({ lat, lng, tipoReporte = 'perdida', etiqueta }) {
  const tienePunto = lat != null && lng != null && lat !== '' && lng !== '';
  const centro = tienePunto ? [Number(lat), Number(lng)] : [-33.4489, -70.6693];
  const zoom = tienePunto ? 16 : 12;

  return (
    <div className={`mini-mapa-borrador ${tienePunto ? 'mini-mapa-borrador-ok' : ''}`}>
      <p className="mini-mapa-titulo">
        {tienePunto ? 'Vista previa de tu punto' : 'Aún no hay punto marcado'}
      </p>
      <div className="mini-mapa-frame">
        <MapContainer
          center={centro}
          zoom={zoom}
          scrollWheelZoom={false}
          dragging={!tienePunto}
          doubleClickZoom={false}
          zoomControl={tienePunto}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
          />
          {tienePunto && (
            <>
              <CentrarBorrador lat={Number(lat)} lng={Number(lng)} />
              <Circle
                center={[Number(lat), Number(lng)]}
                radius={120}
                pathOptions={{
                  color: tipoReporte === 'avistamiento' ? '#0d9488' : '#ff6b4a',
                  fillColor: tipoReporte === 'avistamiento' ? '#0d9488' : '#ff6b4a',
                  fillOpacity: 0.2,
                  weight: 2,
                  dashArray: '6 4',
                }}
              />
              <Marker position={[Number(lat), Number(lng)]} icon={iconBorradorMini} />
            </>
          )}
        </MapContainer>
        {!tienePunto && (
          <div className="mini-mapa-placeholder">
            <span>👆</span>
            <p>Haz clic en el mapa grande para colocar el pin</p>
          </div>
        )}
      </div>
      {tienePunto && etiqueta && <p className="mini-mapa-etiqueta">{etiqueta}</p>}
      {tienePunto && (
        <p className="mini-mapa-coords">
          {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
        </p>
      )}
    </div>
  );
}
