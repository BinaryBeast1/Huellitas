/** Desplaza coords de forma determinística (~150–250 m) para mapas públicos */
function hashId(id) {
    let h = 0;
    const s = String(id);
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i);
    return Math.abs(h);
}

function fuzzCoords(id, lat, lng, metros = 200) {
    const h = hashId(id);
    const ang = (h % 360) * (Math.PI / 180);
    const dist = (metros / 111320) * (0.7 + (h % 30) / 100);
    return {
        latitud: lat + Math.cos(ang) * dist,
        longitud: lng + Math.sin(ang) * dist * 1.2,
        ubicacionAproximada: true
    };
}

function sanitizarReportePublico(doc) {
    const o = doc.toObject ? doc.toObject() : { ...doc };
    if (o.latitud != null && o.longitud != null) {
        const f = fuzzCoords(o._id, o.latitud, o.longitud);
        o.latitud = f.latitud;
        o.longitud = f.longitud;
        o.ubicacionAproximada = true;
    }
    if (o.creador && typeof o.creador === 'object') {
        o.creador = {
            _id: o.creador._id,
            nombre: o.creador.nombre,
            verificado: o.creador.verificado
        };
    }
    return o;
}

module.exports = { fuzzCoords, sanitizarReportePublico };
