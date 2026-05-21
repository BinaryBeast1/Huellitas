export function compartirWhatsApp(reporte) {
  const texto = `🐾 *${reporte.nombre}* (${reporte.especie}) — ${reporte.estado === 'encontrado' ? 'ENCONTRADO' : 'EXTRAVIADO'}
📍 ${reporte.ubicacionNombre || 'Ver mapa'}
${reporte.descripcion?.slice(0, 120) || ''}
— Compartido desde Huellitas`;
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}

export function copiarEnlace(reporteId) {
  const url = `${window.location.origin}?reporte=${reporteId}`;
  navigator.clipboard?.writeText(url);
  return url;
}
