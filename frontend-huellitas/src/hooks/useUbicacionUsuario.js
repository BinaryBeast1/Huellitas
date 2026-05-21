import { useState, useCallback, useEffect } from 'react';

const MENSAJES_ERROR = {
  1: 'Activa el permiso de ubicación en tu navegador',
  2: 'No pudimos obtener tu ubicación',
  3: 'La solicitud de ubicación tardó demasiado',
};

export function useUbicacionUsuario(activo = true) {
  const [ubicacion, setUbicacion] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const actualizar = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }
    setCargando(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setCargando(false);
      },
      (err) => {
        setError(MENSAJES_ERROR[err.code] || err.message);
        setCargando(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  }, []);

  useEffect(() => {
    if (activo) actualizar();
  }, [activo, actualizar]);

  return { ubicacion, error, cargando, actualizar };
}
