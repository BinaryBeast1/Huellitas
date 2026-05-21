export function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Ordena reportes por distancia al usuario y agrega distanciaKm */
export function reportesConDistancia(reportes, lat, lng) {
  if (lat == null || lng == null) return [];
  return reportes
    .filter((m) => m.latitud != null && m.longitud != null)
    .map((m) => ({
      ...m,
      distanciaKm: Math.round(distanciaKm(lat, lng, m.latitud, m.longitud) * 10) / 10
    }))
    .sort((a, b) => a.distanciaKm - b.distanciaKm);
}

/** Solo mascotas dentro del radio (km) */
export function reportesCercanos(reportes, lat, lng, radioKm = 10) {
  return reportesConDistancia(reportes, lat, lng).filter((m) => m.distanciaKm <= radioKm);
}
