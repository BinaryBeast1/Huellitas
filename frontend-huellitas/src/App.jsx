import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { API, headersAuth } from './config';
import { getToken, saveToken, clearToken, esSesionInvalida } from './api/auth';
import { reportesCercanos as filtrarCercanos } from './utils/geo';
import { useUbicacionUsuario } from './hooks/useUbicacionUsuario';
import LandingPage from './components/LandingPage';
import VistaInvitado from './components/VistaInvitado';
import MapaReportes from './components/MapaReportes';
import FeedCercanos from './components/FeedCercanos';
import FormularioReporte, { VACIO } from './components/FormularioReporte';
import ModalContacto from './components/ModalContacto';
import ModalDetalle from './components/ModalDetalle';
import ModalPerfil from './components/ModalPerfil';
import PanelAdmin from './components/PanelAdmin';
import './App.css';

function App() {
  const [reportes, setReportes] = useState([]);
  const [token, setToken] = useState(getToken());
  const [perfil, setPerfil] = useState(null);
  const [usuario, setUsuario] = useState({ nombre: '', email: '', password: '' });
  const [modoRegistro, setModoRegistro] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoReporte, setNuevoReporte] = useState({ ...VACIO });
  const [tipoFlujo, setTipoFlujo] = useState('perdida');
  const [vistaActiva, setVistaActiva] = useState('mapa');
  const [busqueda, setBusqueda] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [contactoModal, setContactoModal] = useState(null);
  const [detalleModal, setDetalleModal] = useState(null);
  const [perfilModal, setPerfilModal] = useState(false);
  const [perfilEdit, setPerfilEdit] = useState({
    nombre: '', email: '', telefono: '', password: '',
    mostrarContacto: false, alertLat: '', alertLng: '', alertRadiusKm: 5
  });
  const [notificaciones, setNotificaciones] = useState(() => {
    try { return JSON.parse(localStorage.getItem('huellitas-notif') || '[]'); }
    catch { return []; }
  });
  const [notifAbierta, setNotifAbierta] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [celebrar, setCelebrar] = useState(false);
  const [radioCercania, setRadioCercania] = useState(10);
  const [soloCercanos, setSoloCercanos] = useState(true);
  const [modoInvitado, setModoInvitado] = useState(false);
  const [cargandoDemo, setCargandoDemo] = useState(false);
  const reportesPrevios = useRef([]);
  const notifRef = useRef(null);

  const {
    ubicacion: miUbicacion,
    error: errorGeo,
    cargando: cargandoGeo,
    actualizar: actualizarUbicacion,
  } = useUbicacionUsuario(!!token);

  const feedCercano = useMemo(() => {
    if (!miUbicacion) return [];
    return filtrarCercanos(reportes, miUbicacion.lat, miUbicacion.lng, radioCercania);
  }, [reportes, miUbicacion, radioCercania]);

  const reportesEnMapa = useMemo(() => {
    if (miUbicacion && soloCercanos) return feedCercano;
    return reportes;
  }, [miUbicacion, soloCercanos, feedCercano, reportes]);

  const agregarNotif = useCallback((texto, tipo = 'info') => {
    const item = { id: Date.now() + Math.random(), texto, tipo, fecha: new Date().toISOString(), leida: false };
    setNotificaciones(prev => {
      const next = [item, ...prev].slice(0, 40);
      localStorage.setItem('huellitas-notif', JSON.stringify(next));
      return next;
    });
  }, []);

  const mostrarToast = useCallback((mensaje, tipo = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, mensaje, tipo }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const cerrarSesionPorToken = useCallback(() => {
    clearToken();
    setToken(null);
    setReportes([]);
    setPerfil(null);
    reportesPrevios.current = [];
    setEditandoId(null);
    setPerfilModal(false);
    mostrarToast('Tu sesión expiró. Inicia sesión de nuevo.', 'error');
  }, [mostrarToast]);

  const manejarRespuestaAuth = useCallback((respuesta, data) => {
    if (esSesionInvalida(respuesta, data)) {
      cerrarSesionPorToken();
      return true;
    }
    return false;
  }, [cerrarSesionPorToken]);

  const verificarAlertasZona = useCallback((lista, user, ubicacion) => {
    const lat = ubicacion?.lat ?? user?.alertLat;
    const lng = ubicacion?.lng ?? user?.alertLng;
    if (lat == null || lng == null) return;
    const radio = user?.alertRadiusKm || radioCercania || 5;
    const prevIds = new Set(reportesPrevios.current.map(r => r._id));
    filtrarCercanos(lista, lat, lng, radio).forEach((r) => {
      if (prevIds.has(r._id)) return;
      agregarNotif(`🔔 Nuevo caso a ${r.distanciaKm} km: ${r.nombre}`, 'alert');
    });
    reportesPrevios.current = lista;
  }, [agregarNotif, radioCercania]);

  const obtenerDatos = useCallback(async () => {
    const authToken = getToken();
    if (!authToken) { setReportes([]); return; }
    try {
      const params = new URLSearchParams();
      if (busqueda) params.set('q', busqueda);
      if (filtroUbicacion) params.set('ubicacion', filtroUbicacion);
      if (filtroEstado) params.set('estado', filtroEstado);
      if (filtroTipo) params.set('tipo', filtroTipo);
      const url = `${API}/api/pets${params.toString() ? '?' + params : ''}`;
      const respuesta = await fetch(url, { headers: { 'x-auth-token': authToken } });
      const datos = await respuesta.json();
      if (manejarRespuestaAuth(respuesta, datos)) return;
      const lista = respuesta.ok && Array.isArray(datos) ? datos : [];
      setReportes(lista);
      if (perfil || miUbicacion) verificarAlertasZona(lista, perfil, miUbicacion);
    } catch (e) { console.error(e); }
  }, [token, busqueda, filtroUbicacion, filtroEstado, filtroTipo, perfil, miUbicacion, verificarAlertasZona, manejarRespuestaAuth]);

  const cargarPerfil = useCallback(async () => {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const r = await fetch(`${API}/api/users/perfil`, { headers: { 'x-auth-token': authToken } });
      const data = await r.json().catch(() => ({}));
      if (manejarRespuestaAuth(r, data)) return;
      if (r.ok) {
        setPerfil(data);
        setPerfilEdit({
          nombre: data.nombre, email: data.email, telefono: data.telefono || '',
          password: '', mostrarContacto: data.mostrarContacto || false,
          alertLat: data.alertLat ?? '', alertLng: data.alertLng ?? '',
          alertRadiusKm: data.alertRadiusKm ?? 5
        });
        if (data.alertRadiusKm) setRadioCercania(data.alertRadiusKm);
      }
    } catch (e) { console.error(e); }
  }, [token, manejarRespuestaAuth]);

  useEffect(() => {
    if (token) obtenerDatos();
    else setReportes([]);
  }, [token, obtenerDatos]);

  useEffect(() => { if (token) cargarPerfil(); else setPerfil(null); }, [token, cargarPerfil]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifAbierta(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const manejarLogin = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario.email, password: usuario.password })
      });
      const data = await r.json();
      if (r.ok && data.token) {
        saveToken(data.token);
        setToken(data.token);
        agregarNotif('Sesión iniciada', 'success');
        mostrarToast('¡Bienvenido!');
      } else mostrarToast(data.mensaje || 'Error', 'error');
    } catch { mostrarToast('Sin conexión', 'error'); }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: usuario.nombre, email: usuario.email, password: usuario.password })
      });
      const data = await r.json();
      if (r.ok && data.token) {
        saveToken(data.token);
        setToken(data.token);
        agregarNotif('Cuenta creada', 'success');
        mostrarToast('¡Bienvenido a Huellitas!');
      } else mostrarToast(data.mensaje || 'Error', 'error');
    } catch { mostrarToast('Sin conexión', 'error'); }
  };

  const cerrarSesion = () => {
    clearToken();
    setToken(null);
    setReportes([]);
    reportesPrevios.current = [];
    setEditandoId(null);
    setPerfilModal(false);
    agregarNotif('Sesión cerrada', 'info');
    mostrarToast('Hasta pronto');
  };

  const entrarDemo = async () => {
    setCargandoDemo(true);
    try {
      const r = await fetch(`${API}/api/users/demo`, { method: 'POST' });
      const data = await r.json();
      if (r.ok && data.token) {
        saveToken(data.token);
        setToken(data.token);
        setModoInvitado(false);
        setVistaActiva('mapa');
        agregarNotif('Modo demostración activo', 'success');
        mostrarToast('¡Bienvenido! Explora casos de ejemplo en el mapa');
      } else {
        mostrarToast(data.mensaje || 'Ejecuta npm run seed:demo en el backend', 'error');
      }
    } catch {
      mostrarToast('Sin conexión con el servidor', 'error');
    } finally {
      setCargandoDemo(false);
    }
  };

  const irALogin = () => {
    setModoInvitado(false);
    setTimeout(() => document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const manejarEnvioReporte = async (e) => {
    e.preventDefault();
    const authToken = getToken();
    if (!authToken) {
      cerrarSesionPorToken();
      return;
    }

    if (!editandoId && (!nuevoReporte.latitud || !nuevoReporte.longitud)) {
      mostrarToast('Marca un punto en el mapa (paso Ubicación)', 'error');
      setVistaActiva('reportar');
      return;
    }

    const formData = new FormData();
    const campos = ['nombre', 'especie', 'raza', 'color', 'descripcion', 'latitud', 'longitud', 'ubicacionNombre', 'tipoReporte', 'recompensa'];
    campos.forEach((k) => {
      const v = nuevoReporte[k];
      if (v !== null && v !== undefined && v !== '') formData.append(k, String(v));
    });
    if (!formData.has('tipoReporte')) formData.append('tipoReporte', tipoFlujo);
    if (nuevoReporte.foto) formData.append('foto', nuevoReporte.foto);

    const url = editandoId ? `${API}/api/pets/${editandoId}` : `${API}/api/pets`;
    try {
      const r = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'x-auth-token': authToken },
        body: formData
      });
      const d = await r.json().catch(() => ({}));
      if (manejarRespuestaAuth(r, d)) return;
      if (r.ok) {
        mostrarToast(editandoId ? 'Actualizado' : 'Publicado');
        agregarNotif(editandoId ? 'Reporte editado' : `Nuevo ${tipoFlujo === 'avistamiento' ? 'avistamiento' : 'reporte de pérdida'}`, 'success');
        obtenerDatos();
        setEditandoId(null);
        setNuevoReporte({ ...VACIO });
        const inputFoto = document.getElementById('input-foto');
        if (inputFoto) inputFoto.value = '';
        setVistaActiva('mapa');
      } else {
        mostrarToast(d.mensaje || 'Error al guardar', 'error');
      }
    } catch { mostrarToast('Error de conexión', 'error'); }
  };

  const prepararEdicion = (m) => {
    setNuevoReporte({ ...m, foto: null });
    setTipoFlujo(m.tipoReporte || 'perdida');
    setEditandoId(m._id);
    setVistaActiva('reportar');
  };

  const abrirDetalle = async (m) => {
    try {
      const r = await fetch(`${API}/api/pets/${m._id}`, { headers: { 'x-auth-token': getToken() } });
      if (r.ok) setDetalleModal(await r.json());
      else setDetalleModal(m);
    } catch { setDetalleModal(m); }
  };

  const manejarEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este reporte permanentemente?')) return;
    const r = await fetch(`${API}/api/pets/${id}`, { method: 'DELETE', headers: { 'x-auth-token': getToken() } });
    if (r.ok) { obtenerDatos(); mostrarToast('Eliminado'); agregarNotif('Reporte eliminado', 'info'); }
    else mostrarToast('No autorizado', 'error');
  };

  const marcarEncontrado = async (id) => {
    const r = await fetch(`${API}/api/pets/${id}/encontrado`, { method: 'PATCH', headers: { 'x-auth-token': getToken() } });
    if (r.ok) {
      obtenerDatos();
      setCelebrar(true);
      setTimeout(() => setCelebrar(false), 4000);
      agregarNotif('¡Mascota encontrada!', 'success');
      mostrarToast('¡Felicitaciones!');
    } else mostrarToast('Error', 'error');
  };

  const denunciar = async (id) => {
    const motivo = window.prompt('Motivo de la denuncia (opcional):') || '';
    const r = await fetch(`${API}/api/pets/${id}/denunciar`, {
      method: 'POST',
      headers: headersAuth(getToken()),
      body: JSON.stringify({ motivo })
    });
    const d = await r.json();
    if (manejarRespuestaAuth(r, d)) return;
    mostrarToast(r.ok ? d.mensaje : d.mensaje || 'Error', r.ok ? 'success' : 'error');
    if (r.ok) obtenerDatos();
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    const body = {
      nombre: perfilEdit.nombre, email: perfilEdit.email, telefono: perfilEdit.telefono,
      mostrarContacto: perfilEdit.mostrarContacto,
      alertRadiusKm: perfilEdit.alertRadiusKm
    };
    if (perfilEdit.alertLat !== '') body.alertLat = perfilEdit.alertLat;
    if (perfilEdit.alertLng !== '') body.alertLng = perfilEdit.alertLng;
    if (perfilEdit.password) body.password = perfilEdit.password;

    const r = await fetch(`${API}/api/users/perfil`, {
      method: 'PUT',
      headers: headersAuth(getToken()),
      body: JSON.stringify(body)
    });
    const d = await r.json();
    if (manejarRespuestaAuth(r, d)) return;
    if (r.ok) {
      setPerfil(d.usuario);
      setPerfilModal(false);
      agregarNotif('Perfil actualizado', 'success');
      mostrarToast('Perfil guardado');
    } else mostrarToast(d.mensaje || 'Error', 'error');
  };

  const esMiReporte = (m) => perfil && m.creador && (m.creador._id === perfil._id || m.creador === perfil._id);
  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const esAdmin = perfil?.rol === 'admin';

  const marcarNotifLeidas = () => {
    setNotificaciones(prev => {
      const next = prev.map(n => ({ ...n, leida: true }));
      localStorage.setItem('huellitas-notif', JSON.stringify(next));
      return next;
    });
  };

  const usarUbicacionAlerta = () => {
    if (miUbicacion) {
      setPerfilEdit(p => ({ ...p, alertLat: miUbicacion.lat, alertLng: miUbicacion.lng }));
      mostrarToast('Alertas configuradas con tu ubicación actual');
    } else if (nuevoReporte.latitud) {
      setPerfilEdit(p => ({ ...p, alertLat: nuevoReporte.latitud, alertLng: nuevoReporte.longitud }));
      mostrarToast('Ubicación de alerta copiada del mapa');
    } else {
      mostrarToast('Activa tu ubicación o marca un punto en el mapa', 'error');
    }
  };

  return (
    <div className={`app ${celebrar ? 'celebrate' : ''}`}>
      <header className="header">
        <a href="/" className="logo"><span className="logo-icon">🐾</span><span>Huellitas</span></a>
        <div className="header-actions">
          {token && (
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button type="button" className="btn btn-icon" onClick={(e) => {
                e.stopPropagation();
                setNotifAbierta(!notifAbierta);
                if (!notifAbierta) marcarNotifLeidas();
              }}>🔔
                {noLeidas > 0 && <span className="badge-count">{noLeidas}</span>}
              </button>
              {notifAbierta && (
                <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
                  <div style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Notificaciones</div>
                  {notificaciones.length === 0 ? <p className="notif-empty">Sin notificaciones</p> :
                    notificaciones.map(n => (
                      <div key={n.id} className={`notif-item ${!n.leida ? 'unread' : ''} notif-${n.tipo}`}>
                        {n.texto}
                        <time>{new Date(n.fecha).toLocaleString('es-CL')}</time>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          {token && perfil && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPerfilModal(true)}>
              👤 {perfil.nombre}
            </button>
          )}
          {token ? (
            <button type="button" className="btn btn-danger btn-sm" onClick={cerrarSesion}>Cerrar sesión</button>
          ) : modoInvitado ? (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModoInvitado(false)}>
              Volver al inicio
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-teal btn-sm" onClick={entrarDemo} disabled={cargandoDemo}>
                Demo
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={irALogin}>
                Iniciar sesión
              </button>
            </>
          )}
        </div>
      </header>

      {!token && modoInvitado ? (
        <VistaInvitado
          onIniciarSesion={irALogin}
          onProbarDemo={entrarDemo}
          cargandoDemo={cargandoDemo}
        />
      ) : !token ? (
        <LandingPage
          modoRegistro={modoRegistro}
          setModoRegistro={setModoRegistro}
          usuario={usuario}
          setUsuario={setUsuario}
          onLogin={manejarLogin}
          onRegistro={manejarRegistro}
          onProbarDemo={entrarDemo}
          onExplorarMapa={() => setModoInvitado(true)}
          cargandoDemo={cargandoDemo}
        />
      ) : (
        <div className="dashboard">
          <aside className="sidebar">
            <nav className="tabs">
              {[
                ['mapa', '🗺️ Mapa'],
                ['reportar', '📝 Reportar'],
                ['lista', '📋 Lista'],
                ...(esAdmin ? [['admin', '⚙️ Admin']] : []),
              ].map(([id, label]) => (
                <button key={id} type="button"
                  className={`tab ${vistaActiva === id ? 'active' : ''}`}
                  onClick={() => setVistaActiva(id)}>
                  {label}
                </button>
              ))}
              <button type="button" className="tab" onClick={() => setPerfilModal(true)}>👤 Mi perfil</button>
            </nav>

            <div className="sidebar-section">
              <h3>Búsqueda y filtros</h3>
              <input type="search" placeholder="Nombre o raza" value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)} className="sidebar-input" />
              <input type="text" placeholder="Ubicación" value={filtroUbicacion}
                onChange={(e) => setFiltroUbicacion(e.target.value)} className="sidebar-input" />
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="sidebar-input">
                <option value="">Estado</option>
                <option value="extraviado">Extraviados</option>
                <option value="encontrado">Encontrados</option>
              </select>
              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="sidebar-input">
                <option value="">Tipo</option>
                <option value="perdida">Perdidas</option>
                <option value="avistamiento">Avistamientos</option>
              </select>
              <button type="button" className="btn btn-teal btn-sm" style={{ width: '100%' }} onClick={obtenerDatos}>Buscar</button>
            </div>

            <div className="sidebar-section feed-section">
              <h3>Cerca de ti</h3>
              <label className="radio-slider-label">
                Radio: <strong>{radioCercania} km</strong>
                <input type="range" min="1" max="30" value={radioCercania}
                  onChange={(e) => setRadioCercania(Number(e.target.value))} className="radio-slider" />
              </label>
              <label className="checkbox-label" style={{ marginBottom: 8 }}>
                <input type="checkbox" checked={soloCercanos}
                  onChange={(e) => setSoloCercanos(e.target.checked)} disabled={!miUbicacion} />
                Solo casos cercanos en el mapa
              </label>
              <FeedCercanos
                items={feedCercano}
                cargando={cargandoGeo}
                errorGeo={errorGeo}
                sinUbicacion={!miUbicacion}
                onActualizarUbicacion={actualizarUbicacion}
                onSeleccionar={setReporteSeleccionado}
                seleccionadoId={reporteSeleccionado}
                onVerDetalle={abrirDetalle}
              />
            </div>

            {vistaActiva === 'reportar' && (
              <>
                <FormularioReporte
                  key={editandoId || `nuevo-${tipoFlujo}`}
                  editandoId={editandoId}
                  nuevoReporte={nuevoReporte}
                  setNuevoReporte={setNuevoReporte}
                  setEditandoId={setEditandoId}
                  onSubmit={manejarEnvioReporte}
                  tipoFlujo={tipoFlujo}
                  setTipoFlujo={setTipoFlujo}
                />
                <button type="button" className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8 }}
                  onClick={usarUbicacionAlerta}>
                  Usar punto del mapa para alertas en mi zona
                </button>
              </>
            )}
            {vistaActiva === 'admin' && esAdmin && <PanelAdmin token={token} mostrarToast={mostrarToast} />}
          </aside>

          <main className="main-content">
            {(vistaActiva === 'mapa' || vistaActiva === 'reportar' || vistaActiva === 'lista') && (
              <div className="search-bar">
                <input type="search" placeholder="🔍 Buscar por nombre o raza" value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)} />
                <input type="text" placeholder="📍 Filtrar por ubicación" value={filtroUbicacion}
                  onChange={(e) => setFiltroUbicacion(e.target.value)} />
                <button type="button" className="btn btn-teal" onClick={obtenerDatos}>Buscar</button>
              </div>
            )}
            {(vistaActiva === 'mapa' || vistaActiva === 'reportar') && (
              <MapaReportes
                reportes={reportesEnMapa}
                token={token}
                vistaActiva={vistaActiva}
                reporteSeleccionado={reporteSeleccionado}
                ubicacionUsuario={miUbicacion}
                radioKm={radioCercania}
                onMapClick={(lat, lng) => {
                  setNuevoReporte((r) => ({ ...r, latitud: lat, longitud: lng }));
                  mostrarToast('Punto marcado en el mapa', 'success');
                }}
                puntoBorrador={vistaActiva === 'reportar' ? {
                  latitud: nuevoReporte.latitud,
                  longitud: nuevoReporte.longitud,
                  tipoReporte: tipoFlujo,
                  nombre: nuevoReporte.nombre,
                  ubicacionNombre: nuevoReporte.ubicacionNombre,
                } : null}
                onSelect={setReporteSeleccionado}
                onDetalle={abrirDetalle}
                onContactar={setContactoModal}
                onEncontrado={marcarEncontrado}
                onEditar={prepararEdicion}
                onEliminar={manejarEliminar}
                onDenunciar={denunciar}
                esMiReporte={esMiReporte}
              />
            )}
            {vistaActiva === 'lista' && (
              <div className="lista-grid">
                {reportes.map(m => (
                  <article key={m._id} className="lista-card" onClick={() => abrirDetalle(m)}>
                    {m.fotoUrl && <img src={`${API}${m.fotoUrl}`} alt={m.nombre} />}
                    <div className="lista-card-body">
                      <h4>{m.nombre}</h4>
                      <p>{m.descripcion?.slice(0, 100)}</p>
                      <span className={`status-badge status-${m.estado || 'extraviado'}`}>{m.estado}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>

          <nav className="bottom-nav" aria-label="Navegación principal">
            {[
              ['mapa', '🗺️', 'Mapa'],
              ['reportar', '📝', 'Reportar'],
              ['lista', '📋', 'Lista'],
              ...(esAdmin ? [['admin', '⚙️', 'Admin']] : []),
            ].map(([id, icon, label]) => (
              <button
                key={id}
                type="button"
                className={`bottom-nav-item ${vistaActiva === id ? 'active' : ''}`}
                onClick={() => setVistaActiva(id)}
              >
                <span className="bottom-nav-icon">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
            <button
              type="button"
              className={`bottom-nav-item ${perfilModal ? 'active' : ''}`}
              onClick={() => setPerfilModal(true)}
            >
              <span className="bottom-nav-icon">👤</span>
              <span>Perfil</span>
            </button>
          </nav>
        </div>
      )}

      {contactoModal && (
        <ModalContacto
          reporte={contactoModal}
          token={token}
          onClose={() => setContactoModal(null)}
          mostrarToast={mostrarToast}
        />
      )}
      {detalleModal && (
        <ModalDetalle
          reporte={detalleModal}
          token={token}
          onClose={() => setDetalleModal(null)}
          onContactar={(r) => { setDetalleModal(null); setContactoModal(r); }}
          onRequiereLogin={irALogin}
          mostrarToast={mostrarToast}
        />
      )}
      {perfilModal && token && (
        <ModalPerfil
          perfilEdit={perfilEdit}
          setPerfilEdit={setPerfilEdit}
          onSubmit={guardarPerfil}
          onClose={() => setPerfilModal(false)}
        />
      )}

      {celebrar && <div className="confetti-overlay">🎉 ¡Encontrado!</div>}

      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast ${t.tipo}`}>{t.mensaje}</div>)}
      </div>
    </div>
  );
}

export default App;
