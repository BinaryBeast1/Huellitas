import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { API, headersAuth } from '../config';
import {
  urlCaso,
  compartirWhatsApp,
  whatsappAlDueño,
  whatsappAvistamiento,
  compartirNativo,
  copiarEnlace,
  imprimirPoster,
  puedeWhatsAppDueño,
} from '../utils/share';

const ICONO_EVENTO = {
  'Reporte de pérdida': '📢',
  'Avistamiento registrado': '👀',
  'Reporte actualizado': '✏️',
  'Mascota encontrada': '✅',
  'Reporte creado': '📢',
  'Moderación': '⚠️',
  'Vinculado a reporte de pérdida': '🔗',
};

function iconoPara(evento) {
  if (ICONO_EVENTO[evento]) return ICONO_EVENTO[evento];
  if (evento?.toLowerCase().includes('encontrad')) return '✅';
  if (evento?.toLowerCase().includes('avistamiento')) return '👀';
  return '🐾';
}

function FotoMascota({ reporte, className }) {
  if (!reporte?.fotoUrl) {
    return <div className={`match-foto-placeholder ${className || ''}`}>🐾</div>;
  }
  return <img src={`${API}${reporte.fotoUrl}`} alt={reporte.nombre} className={className} />;
}

export default function ModalDetalle({
  reporte,
  token,
  publico = false,
  onClose,
  onContactar,
  onRequiereLogin,
  mostrarToast,
  onReporteActualizado,
}) {
  const [similares, setSimilares] = useState([]);
  const [matchSeleccionado, setMatchSeleccionado] = useState(null);
  const [avistamientos, setAvistamientos] = useState([]);
  const [vinculando, setVinculando] = useState(false);

  useEffect(() => {
    if (!reporte?._id) return;
    const url = publico
      ? `${API}/api/pets/public/${reporte._id}/similares`
      : `${API}/api/pets/${reporte._id}/similares`;
    const opts = token ? { headers: headersAuth(token) } : {};
    fetch(url, opts)
      .then((r) => r.json())
      .then((d) => {
        const lista = d.similares || [];
        setSimilares(lista);
        if (lista[0]) setMatchSeleccionado(lista[0]);
      })
      .catch(() => setSimilares([]));
  }, [reporte, token, publico]);

  useEffect(() => {
    if (!reporte?._id || reporte.tipoReporte !== 'perdida') {
      setAvistamientos([]);
      return;
    }
    const url = publico
      ? `${API}/api/pets/public/${reporte._id}/caso`
      : `${API}/api/pets/${reporte._id}/caso`;
    const opts = token ? { headers: headersAuth(token) } : {};
    fetch(url, opts)
      .then((r) => r.json())
      .then((d) => setAvistamientos(d.avistamientos || []))
      .catch(() => setAvistamientos([]));
  }, [reporte, token, publico]);

  if (!reporte) return null;

  const link = urlCaso(reporte._id);
  const estadoLabel = reporte.estado === 'encontrado'
    ? 'Encontrado'
    : reporte.tipoReporte === 'avistamiento'
      ? 'Avistamiento'
      : 'Extraviado';

  const historial = reporte.historial?.length
    ? [...reporte.historial].reverse()
    : [{ evento: 'Reporte creado', detalle: reporte.ubicacionNombre, fecha: reporte.fechaExtravio }];

  const dueñoWa = puedeWhatsAppDueño(reporte);

  const handleWhatsAppDueño = () => {
    if (!token) {
      onRequiereLogin?.();
      return;
    }
    const r = whatsappAlDueño(reporte);
    if (r.ok) mostrarToast?.('Abriendo chat con el dueño en WhatsApp');
    else mostrarToast?.(r.razon, 'error');
  };

  const handleViMascota = () => {
    if (!token) {
      onRequiereLogin?.();
      return;
    }
    const r = whatsappAvistamiento(reporte);
    if (r.ok) mostrarToast?.('Abriendo WhatsApp');
    else mostrarToast?.(r.razon || 'No se pudo abrir', 'error');
  };

  const vincularCon = async (perdidaId) => {
    if (!token || !reporte?._id) return;
    setVinculando(true);
    try {
      const r = await fetch(`${API}/api/pets/${reporte._id}/vincular`, {
        method: 'PATCH',
        headers: headersAuth(token),
        body: JSON.stringify({ reportePerdidaId: perdidaId }),
      });
      const d = await r.json();
      if (r.ok) {
        mostrarToast?.('Avistamiento vinculado al caso');
        onReporteActualizado?.(d.reporte);
      } else mostrarToast?.(d.mensaje || 'Error', 'error');
    } catch {
      mostrarToast?.('Error de conexión', 'error');
    }
    setVinculando(false);
  };

  const contactarMatch = () => {
    const r = matchSeleccionado?.reporte;
    if (!r) return;
    if (!token) {
      onRequiereLogin?.();
      return;
    }
    if (reporte.tipoReporte === 'avistamiento' && r.tipoReporte === 'perdida') {
      vincularCon(r._id);
      return;
    }
    onContactar(r);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-ficha" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>

        {reporte.fotoUrl && (
          <div className="ficha-hero">
            <img src={`${API}${reporte.fotoUrl}`} alt={reporte.nombre} />
            <div className="ficha-hero-overlay" />
          </div>
        )}

        <div className="ficha-body">
          <h2 className="ficha-nombre">{reporte.nombre}</h2>
          <div className="ficha-badges">
            <span className={`status-badge status-${reporte.estado || 'extraviado'}`}>{estadoLabel}</span>
            {reporte.creador?.verificado && <span className="verified-badge">✓ Verificado</span>}
            {reporte.ubicacionAproximada && <span className="verified-badge">📍 Ubicación aprox.</span>}
          </div>

          {reporte.reportePerdida && (
            <p className="ficha-vinculo">
              🔗 Vinculado al caso: <strong>{reporte.reportePerdida.nombre}</strong>
            </p>
          )}

          <div className="ficha-datos">
            <div className="ficha-dato">
              <span className="ficha-dato-label">Especie</span>
              <span>{reporte.especie}{reporte.raza ? ` · ${reporte.raza}` : ''}</span>
            </div>
            <div className="ficha-dato">
              <span className="ficha-dato-label">Color</span>
              <span>{reporte.color || '—'}</span>
            </div>
            <div className="ficha-dato ficha-dato-wide">
              <span className="ficha-dato-label">Descripción</span>
              <span>{reporte.descripcion}</span>
            </div>
            <div className="ficha-dato ficha-dato-wide">
              <span className="ficha-dato-label">Ubicación</span>
              <span>📍 {reporte.ubicacionNombre}</span>
            </div>
            {reporte.recompensa > 0 && (
              <div className="ficha-dato ficha-recompensa">
                <span className="ficha-dato-label">Recompensa</span>
                <span>💰 ${reporte.recompensa?.toLocaleString('es-CL')}</span>
              </div>
            )}
          </div>

          <div className="ficha-actions ficha-actions-wa">
            <button
              type="button"
              className="btn btn-sm btn-wa"
              onClick={() => { compartirWhatsApp(reporte); mostrarToast?.('Abriendo WhatsApp para compartir'); }}
            >
              📤 Compartir en WhatsApp
            </button>
            {dueñoWa && (
              <button type="button" className="btn btn-sm btn-wa-dueno" onClick={handleWhatsAppDueño}>
                💬 WhatsApp al dueño
              </button>
            )}
            {reporte.tipoReporte !== 'avistamiento' && reporte.estado !== 'encontrado' && (
              <button type="button" className="btn btn-sm btn-teal" onClick={handleViMascota}>
                👀 Vi esta mascota
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={async () => {
                await copiarEnlace(reporte._id);
                mostrarToast?.('Enlace copiado');
              }}
            >
              Copiar enlace
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={async () => {
                const r = await compartirNativo(reporte);
                if (r.ok && r.metodo === 'native') mostrarToast?.('Compartido');
              }}
            >
              Compartir…
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => {
                if (imprimirPoster(reporte, API)) mostrarToast?.('Póster listo para imprimir');
              }}
            >
              🖨️ Póster
            </button>
            {token ? (
              <button type="button" className="btn btn-sm btn-primary" onClick={() => onContactar(reporte)}>
                Chat seguro
              </button>
            ) : (
              <button type="button" className="btn btn-sm btn-primary" onClick={onRequiereLogin}>
                Iniciar sesión
              </button>
            )}
          </div>

          {!dueñoWa && token && reporte.tipoReporte !== 'avistamiento' && (
            <p className="form-hint ficha-wa-hint">
              El dueño no activó contacto por WhatsApp. Usa el chat seguro o comparte el caso para que más gente lo vea.
            </p>
          )}

          {matchSeleccionado && (
            <div className="ficha-match-card">
              <h4 className="ficha-section-title">¿Podría ser el mismo caso?</h4>
              <div className="match-visual">
                <div className="match-col">
                  <FotoMascota reporte={reporte} className="match-foto" />
                  <span className="match-label">{reporte.nombre}</span>
                </div>
                <div className="match-vs">
                  <span className="match-score">{matchSeleccionado.score}%</span>
                  <small>{matchSeleccionado.distanciaKm} km</small>
                </div>
                <div className="match-col">
                  <FotoMascota reporte={matchSeleccionado.reporte} className="match-foto" />
                  <span className="match-label">{matchSeleccionado.reporte.nombre}</span>
                </div>
              </div>
              <p className="match-ubicacion">📍 {matchSeleccionado.reporte.ubicacionNombre}</p>
              <button
                type="button"
                className="btn btn-primary btn-sm match-cta"
                onClick={contactarMatch}
                disabled={vinculando}
              >
                {!token && 'Iniciar sesión para contactar'}
                {token && reporte.tipoReporte === 'avistamiento' && matchSeleccionado.reporte.tipoReporte === 'perdida' && (vinculando ? 'Vinculando…' : '🔗 Vincular con este caso')}
                {token && !(reporte.tipoReporte === 'avistamiento' && matchSeleccionado.reporte.tipoReporte === 'perdida') && 'Contactar por este match'}
              </button>
              {similares.length > 1 && (
                <div className="match-picker">
                  {similares.map((s) => (
                    <button
                      key={s.reporte._id}
                      type="button"
                      className={`match-chip ${matchSeleccionado.reporte._id === s.reporte._id ? 'active' : ''}`}
                      onClick={() => setMatchSeleccionado(s)}
                    >
                      {s.reporte.nombre} ({s.score}%)
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {avistamientos.length > 0 && (
            <div className="ficha-similares-card">
              <h4 className="ficha-section-title">Avistamientos vinculados ({avistamientos.length})</h4>
              <ul className="similares-list-v2">
                {avistamientos.map((a) => (
                  <li key={a._id}>
                    <strong>{a.nombre}</strong>
                    <span className="similares-meta">{a.creador?.nombre}</span>
                    <small>📍 {a.ubicacionNombre}</small>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="ficha-timeline-card">
            <h4 className="ficha-section-title">Historial del caso</h4>
            <ol className="timeline-v2">
              {historial.map((h, i) => (
                <li key={i} className="timeline-v2-item">
                  <div className="timeline-v2-marker" aria-hidden>
                    <span className="timeline-v2-icon">{iconoPara(h.evento)}</span>
                    {i < historial.length - 1 && <span className="timeline-v2-line" />}
                  </div>
                  <div className="timeline-v2-content">
                    <p className="timeline-v2-evento">{h.evento}</p>
                    {h.detalle && <p className="timeline-v2-detalle">{h.detalle}</p>}
                    <time>{new Date(h.fecha).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })}</time>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="ficha-qr">
            <QRCodeSVG value={link} size={88} />
            <p>Escanea para abrir este caso en Huellitas</p>
            <small className="ficha-qr-url">{link}</small>
          </div>
        </div>
      </div>
    </div>
  );
}
