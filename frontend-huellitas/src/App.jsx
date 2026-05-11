import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [reportes, setReportes] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  
  const [usuario, setUsuario] = useState({ nombre: '', email: '', password: '' }); 
  
  const [modoRegistro, setModoRegistro] = useState(false); 
  
  const [editandoId, setEditandoId] = useState(null); 
  const [nuevoReporte, setNuevoReporte] = useState({
    nombre: '', especie: 'Perro', raza: '', color: '',
    descripcion: '', latitud: '', longitud: '', ubicacionNombre: ''
  });

  const obtenerDatos = async () => {
    try {
      const respuesta = await fetch('http://localhost:3000/api/pets');
      const datos = await respuesta.json();
      setReportes(datos);
    } catch (error) {
      console.error("Error al conectar:", error);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const manejarLogin = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario.email, password: usuario.password })
      });
      const data = await respuesta.json();

      if (respuesta.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        alert("Error al entrar: " + data.mensaje);
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor");
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: usuario.nombre, email: usuario.email, password: usuario.password })
      });
      const data = await respuesta.json();

      if (respuesta.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        alert("¡Cuenta creada con éxito! Bienvenido a Huellitas 🐾");
      } else {
        alert("Error al registrar: " + (data.mensaje || "Revisa tus datos"));
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor");
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setToken(null);
    setEditandoId(null);
  };

  const manejarEnvioReporte = async (e) => {
    e.preventDefault();
    const url = editandoId ? `http://localhost:3000/api/pets/${editandoId}` : 'http://localhost:3000/api/pets';
    const metodo = editandoId ? 'PUT' : 'POST';

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(nuevoReporte)
      });
      if (respuesta.ok) {
        alert(editandoId ? "¡Actualizado! ✏️" : "¡Creado! 🐶");
        obtenerDatos();
        setEditandoId(null);
        setNuevoReporte({ nombre: '', especie: 'Perro', raza: '', color: '', descripcion: '', latitud: '', longitud: '', ubicacionNombre: '' });
      } else {
        alert("Error de autorización");
      }
    } catch (error) { console.error(error); }
  };

  const prepararEdicion = (mascota) => {
    setNuevoReporte({ ...mascota });
    setEditandoId(mascota._id);
  };

  const manejarEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este reporte?")) return;
    try {
      const respuesta = await fetch(`http://localhost:3000/api/pets/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (respuesta.ok) {
        obtenerDatos();
        if (editandoId === id) setEditandoId(null);
      } else {
        alert("No autorizado para eliminar");
      }
    } catch (error) { console.error(error); }
  };

  function CapturarClic() {
    useMapEvents({
      click(e) { if (token) setNuevoReporte({ ...nuevoReporte, latitud: e.latlng.lat, longitud: e.latlng.lng }); },
    });
    return null;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🐾 Huellitas App</h1>
        {token && <button onClick={cerrarSesion} style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Cerrar Sesión</button>}
      </header>

      {!token ? (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
          
          {/* TÍTULO*/}
          <h2>{modoRegistro ? 'Crear Nueva Cuenta' : 'Iniciar Sesión'}</h2>
          
          {/* FORMULARIO */}
          <form onSubmit={modoRegistro ? manejarRegistro : manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* pedimos el Nombre */}
            {modoRegistro && (
              <input type="text" placeholder="Tu Nombre" required onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })} />
            )}
            
            <input type="email" placeholder="Email" required onChange={(e) => setUsuario({ ...usuario, email: e.target.value })} />
            <input type="password" placeholder="Contraseña" required onChange={(e) => setUsuario({ ...usuario, password: e.target.value })} />
            
            <button type="submit" style={{ padding: '10px', backgroundColor: '#4285f4', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {modoRegistro ? 'Registrarme' : 'Entrar'}
            </button>
          </form>

          {/* BOTÓN PARA ALTERNAR ENTRE LOGIN Y REGISTRO */}
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <button 
              onClick={() => setModoRegistro(!modoRegistro)} 
              style={{ background: 'none', border: 'none', color: '#4285f4', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {modoRegistro ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>

        </div>
      ) : (
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{editandoId ? "✏️ Editando" : "📝 Nuevo Reporte"}</h3>
              {editandoId && <button onClick={() => { setEditandoId(null); setNuevoReporte({nombre: '', especie: 'Perro', raza: '', color: '', descripcion: '', latitud: '', longitud: '', ubicacionNombre: ''}) }} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', textDecoration: 'underline' }}>Cancelar</button>}
            </div>
            <form onSubmit={manejarEnvioReporte} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Nombre Mascota" required value={nuevoReporte.nombre || ''} onChange={(e) => setNuevoReporte({ ...nuevoReporte, nombre: e.target.value })} />
              <input type="text" placeholder="Descripción" required value={nuevoReporte.descripcion || ''} onChange={(e) => setNuevoReporte({ ...nuevoReporte, descripcion: e.target.value })} />
              <div style={{ fontSize: '12px', color: '#666' }}>📍 Haz clic en el mapa para marcar/actualizar ubicación</div>
              <input type="text" placeholder="Ubicación (ej: Plaza)" required value={nuevoReporte.ubicacionNombre || ''} onChange={(e) => setNuevoReporte({ ...nuevoReporte, ubicacionNombre: e.target.value })} />
              <button type="submit" style={{ padding: '10px', backgroundColor: editandoId ? '#ff9800' : '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {editandoId ? "Actualizar" : "Publicar"}
              </button>
            </form>
          </div>
          <div style={{ flex: '2', minWidth: '400px' }}>
            <MapContainer center={[-33.4489, -70.6693]} zoom={13} style={{ height: "60vh", width: "100%", borderRadius: '10px' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <CapturarClic />
              {reportes.map((m) => (
                m.latitud && (
                  <Marker key={m._id} position={[m.latitud, m.longitud]}>
                    <Popup>
                      <strong>{m.nombre}</strong><br/>{m.descripcion}<br/><small>📍 {m.ubicacionNombre}</small><br/><hr style={{ margin: '5px 0' }}/>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                        <button onClick={() => prepararEdicion(m)} style={{ background: '#ff9800', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '3px 8px' }}>✏️</button>
                        <button onClick={() => manejarEliminar(m._id)} style={{ background: '#f44336', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '3px 8px' }}>🗑️</button>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;