/** Geocodificación inversa con Nominatim (OpenStreetMap) */
export async function geocodificarInverso(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const r = await fetch(url, {
      headers: { 'Accept-Language': 'es', 'User-Agent': 'HuellitasApp/1.0' },
    });
    if (!r.ok) return null;
    const data = await r.json();
    const a = data.address;
    if (!a) return data.display_name?.slice(0, 120) || null;
    const partes = [
      a.road || a.pedestrian,
      a.suburb || a.neighbourhood,
      a.city || a.town || a.municipality,
    ].filter(Boolean);
    return partes.length ? partes.join(', ') : data.display_name?.slice(0, 120);
  } catch {
    return null;
  }
}
