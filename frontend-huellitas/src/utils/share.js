/** URL pública del caso (compartible) */
export function urlCaso(reporteId) {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/caso/${reporteId}`;
}

/** Enlace a Google Maps con las coordenadas del reporte */
export function urlMapa(reporte) {
  if (reporte?.latitud == null || reporte?.longitud == null) return null;
  return `https://www.google.com/maps?q=${reporte.latitud},${reporte.longitud}`;
}

/**
 * Normaliza teléfono chileno/internacional para wa.me (solo dígitos, con código país).
 * Ej: 9 1234 5678 → 56912345678
 */
export function normalizarTelefonoWhatsapp(telefono) {
  if (!telefono) return null;
  let digits = String(telefono).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('56') && digits.length >= 11) return digits;
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 9 && digits.startsWith('9')) return `56${digits}`;
  if (digits.length === 8) return `569${digits}`;
  if (digits.length >= 10 && !digits.startsWith('56')) return `56${digits}`;
  return digits.length >= 10 ? digits : null;
}

export function puedeWhatsAppDueño(reporte) {
  const c = reporte?.creador;
  return !!(c?.mostrarContacto && normalizarTelefonoWhatsapp(c?.telefono));
}

/** Texto rico para compartir un caso */
export function mensajeCaso(reporte, { paraDueño = false, mensajeExtra = '' } = {}) {
  const tipo = reporte.tipoReporte === 'avistamiento' ? 'Avistamiento' : 'Mascota extraviada';
  const estado = reporte.estado === 'encontrado' ? '✅ ENCONTRADO' : '🔍 ACTIVO';
  const link = urlCaso(reporte._id);
  const mapa = urlMapa(reporte);
  const lines = [
    `🐾 *Huellitas — ${tipo}*`,
    `*${reporte.nombre}* (${reporte.especie || 'mascota'})`,
    estado,
    '',
    reporte.raza ? `Raza: ${reporte.raza}` : null,
    reporte.color ? `Color: ${reporte.color}` : null,
    `📍 ${reporte.ubicacionNombre || 'Ver ubicación en el mapa'}`,
    reporte.descripcion ? `\n${reporte.descripcion.slice(0, 280)}` : null,
    reporte.recompensa > 0 ? `\n💰 Recompensa: $${reporte.recompensa.toLocaleString('es-CL')}` : null,
    '',
    `🔗 Ver caso completo:\n${link}`,
    mapa ? `\n🗺️ Ubicación en mapa:\n${mapa}` : null,
    mensajeExtra ? `\n${mensajeExtra}` : null,
    '',
    paraDueño
      ? '_Te escribo desde Huellitas por tu reporte._'
      : '_Ayuda a difundir — Huellitas_',
  ].filter(Boolean);
  return lines.join('\n');
}

function abrirWhatsApp({ telefono, texto }) {
  const text = encodeURIComponent(texto);
  const url = telefono
    ? `https://api.whatsapp.com/send?phone=${telefono}&text=${text}`
    : `https://wa.me/?text=${text}`;
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (!w) window.location.href = url;
  return true;
}

/** Compartir caso (sin número → elige contacto en WhatsApp) */
export function compartirWhatsApp(reporte) {
  return abrirWhatsApp({ texto: mensajeCaso(reporte) });
}

/** Escribir al dueño por WhatsApp (requiere teléfono + mostrarContacto) */
export function whatsappAlDueño(reporte, mensajePersonalizado = '') {
  const phone = normalizarTelefonoWhatsapp(reporte?.creador?.telefono);
  if (!reporte?.creador?.mostrarContacto || !phone) {
    return { ok: false, razon: 'El dueño no compartió su WhatsApp. Usa el chat seguro de la app.' };
  }
  const extra = mensajePersonalizado
    || `Hola ${reporte.creador.nombre || ''}, vi el reporte de *${reporte.nombre}* y quiero ayudar.`;
  abrirWhatsApp({
    telefono: phone,
    texto: mensajeCaso(reporte, { paraDueño: true, mensajeExtra: extra }),
  });
  return { ok: true };
}

/** Mensaje prellenado: "vi a esta mascota" (para avistamientos o difusión) */
export function whatsappAvistamiento(reporte) {
  const extra = `👀 *Creo que vi a esta mascota* cerca de ${reporte.ubicacionNombre || 'la zona del reporte'}. ¿Sigue extraviada?`;
  if (puedeWhatsAppDueño(reporte)) {
    return whatsappAlDueño(reporte, extra);
  }
  compartirWhatsApp(reporte);
  return { ok: true };
}

/** Web Share API en móvil si está disponible */
export async function compartirNativo(reporte) {
  const texto = mensajeCaso(reporte);
  const url = urlCaso(reporte._id);
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Huellitas — ${reporte.nombre}`,
        text: texto.split('\n').slice(0, 6).join('\n'),
        url,
      });
      return { ok: true, metodo: 'native' };
    } catch (e) {
      if (e.name === 'AbortError') return { ok: false, cancelado: true };
    }
  }
  compartirWhatsApp(reporte);
  return { ok: true, metodo: 'whatsapp' };
}

export async function copiarEnlace(reporteId) {
  const url = urlCaso(reporteId);
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  return url;
}

/** Abre ventana imprimible tipo póster */
export function imprimirPoster(reporte, apiBase) {
  const foto = reporte.fotoUrl ? `${apiBase}${reporte.fotoUrl}` : '';
  const link = urlCaso(reporte._id);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${reporte.nombre} — Huellitas</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 24px; max-width: 480px; }
  h1 { color: #c2410c; margin: 0 0 8px; }
  img { width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; }
  .tag { background: #ff6b4a; color: #fff; padding: 4px 12px; border-radius: 999px; font-weight: bold; }
  .qr { margin-top: 16px; font-size: 12px; word-break: break-all; }
</style></head><body>
  ${foto ? `<img src="${foto}" alt="${reporte.nombre}">` : ''}
  <p class="tag">${reporte.estado === 'encontrado' ? 'ENCONTRADO' : 'SE BUSCA'}</p>
  <h1>${reporte.nombre}</h1>
  <p><strong>${reporte.especie}</strong>${reporte.raza ? ` · ${reporte.raza}` : ''} · ${reporte.color || ''}</p>
  <p>📍 ${reporte.ubicacionNombre || ''}</p>
  <p>${reporte.descripcion || ''}</p>
  ${reporte.recompensa > 0 ? `<p><strong>Recompensa: $${reporte.recompensa.toLocaleString('es-CL')}</strong></p>` : ''}
  <p class="qr">Escanea o visita: ${link}</p>
  <script>window.onload = () => window.print()</script>
</body></html>`;
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}
