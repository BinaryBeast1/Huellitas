import { useEffect, useState } from 'react';
import { API } from '../config';
import MapaReportes from './MapaReportes';
import ModalDetalle from './ModalDetalle';

export default function VistaInvitado({ onIniciarSesion, onProbarDemo, cargandoDemo }) {
  const [reportes, setReportes] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/pets/public/mapa`)
      .then((r) => r.json())
      .then((d) => setReportes(Array.isArray(d) ? d : []))
      .catch(() => setReportes([]));
  }, []);

  const abrirDetalle = async (m) => {
    try {
      const r = await fetch(`${API}/api/pets/public/${m._id}`);
      if (r.ok) setDetalle(await r.json());
      else setDetalle(m);
    } catch {
      setDetalle(m);
    }
  };

  return (
    <div className="vista-invitado">
      <div className="guest-banner guest-banner-sticky">
        <div>
          <strong>Explorando el mapa</strong>
          <span> · Inicia sesión para reportar, contactar y recibir alertas</span>
        </div>
        <div className="guest-banner-actions">
          <button type="button" className="btn btn-teal btn-sm" onClick={onProbarDemo} disabled={cargandoDemo}>
            {cargandoDemo ? 'Cargando…' : '⚡ Probar demo'}
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onIniciarSesion}>
            Iniciar sesión
          </button>
        </div>
      </div>
      <MapaReportes
        reportes={reportes}
        token={null}
        vistaActiva="mapa"
        reporteSeleccionado={seleccionado}
        ubicacionUsuario={null}
        radioKm={15}
        onMapClick={() => {}}
        onSelect={setSeleccionado}
        onDetalle={abrirDetalle}
        onContactar={onIniciarSesion}
        onEncontrado={() => {}}
        onEditar={() => {}}
        onEliminar={() => {}}
        onDenunciar={() => {}}
        esMiReporte={() => false}
        modoInvitado
      />
      {detalle && (
        <ModalDetalle
          reporte={detalle}
          token={null}
          publico
          onClose={() => setDetalle(null)}
          onContactar={onIniciarSesion}
          onRequiereLogin={onIniciarSesion}
          mostrarToast={() => {}}
        />
      )}
    </div>
  );
}
