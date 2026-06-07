import { useState, useEffect, useCallback } from 'react';
import { API, headersAuth } from '../config';
import { whatsappAlDueño, puedeWhatsAppDueño } from '../utils/share';

export default function ModalContacto({ reporte: reporteInicial, token, onClose, mostrarToast }) {
  const [reporte, setReporte] = useState(reporteInicial);
  const [mensaje, setMensaje] = useState('');
  const [historial, setHistorial] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setReporte(reporteInicial);
    if (!reporteInicial?._id || !token) return;
    fetch(`${API}/api/pets/${reporteInicial._id}`, { headers: headersAuth(token) })
      .then((r) => r.json())
      .then((d) => { if (d._id) setReporte(d); })
      .catch(() => {});
  }, [reporteInicial, token]);

  const cargarMensajes = useCallback(() => {
    if (!reporte?._id || !token) return;
    fetch(`${API}/api/messages/reporte/${reporte._id}`, { headers: headersAuth(token) })
      .then((r) => r.json())
      .then((data) => setHistorial(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [reporte, token]);

  useEffect(() => {
    cargarMensajes();
    const id = setInterval(cargarMensajes, 5000);
    return () => clearInterval(id);
  }, [cargarMensajes]);

  const enviar = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    setEnviando(true);
    try {
      const r = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: headersAuth(token),
        body: JSON.stringify({ reporteId: reporte._id, texto: mensaje }),
      });
      const data = await r.json();
      if (r.ok) {
        setMensaje('');
        setHistorial((h) => [...h, data.data]);
        mostrarToast('Mensaje enviado de forma segura');
      } else {
        mostrarToast(data.mensaje || 'Error', 'error');
      }
    } catch {
      mostrarToast('Error de conexión', 'error');
    }
    setEnviando(false);
  };

  const waDueño = puedeWhatsAppDueño(reporte);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>×</button>
        <h3>💬 Contactar al dueño</h3>
        <p>Reporte: <strong>{reporte?.nombre}</strong></p>

        {waDueño && (
          <button
            type="button"
            className="btn btn-wa btn-sm"
            style={{ width: '100%', marginBottom: 12 }}
            onClick={() => {
              const r = whatsappAlDueño(reporte);
              if (r.ok) mostrarToast('Abriendo WhatsApp…');
              else mostrarToast(r.razon, 'error');
            }}
          >
            💬 Escribir por WhatsApp al dueño
          </button>
        )}

        <div className="chat-box">
          {historial.length === 0 ? (
            <p className="notif-empty">Sin mensajes. Escribe para ayudar al dueño.</p>
          ) : (
            historial.map((m) => (
              <div key={m._id} className="chat-bubble">
                <strong>{m.de?.nombre}</strong>
                <p>{m.texto}</p>
                <time>{new Date(m.fecha).toLocaleString('es-CL')}</time>
              </div>
            ))
          )}
        </div>

        <form onSubmit={enviar} className="chat-form">
          <textarea
            placeholder="Hola, vi tu reporte y puedo ayudar…"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar mensaje seguro'}
          </button>
        </form>

        {reporte?.creador?.mostrarContacto && reporte?.creador?.email && (
          <div className="contact-info" style={{ marginTop: 12 }}>
            <p><small>Contacto directo autorizado:</small></p>
            <p>📧 <a href={`mailto:${reporte.creador.email}`}>{reporte.creador.email}</a></p>
            {reporte.creador.telefono && !waDueño && (
              <p><small>Teléfono registrado pero WhatsApp no compartido en perfil.</small></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
