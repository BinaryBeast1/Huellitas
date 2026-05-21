import { useEffect, useState } from 'react';
import { API, headersAuth } from '../config';

export default function PanelAdmin({ token, mostrarToast }) {
  const [resumen, setResumen] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const cargar = () => {
    const h = headersAuth(token);
    Promise.all([
      fetch(`${API}/api/admin/resumen`, { headers: h }).then((r) => r.json()),
      fetch(`${API}/api/admin/reportes`, { headers: h }).then((r) => r.json()),
      fetch(`${API}/api/admin/usuarios`, { headers: h }).then((r) => r.json()),
    ]).then(([res, rep, usr]) => {
      setResumen(res);
      setReportes(Array.isArray(rep) ? rep : []);
      setUsuarios(Array.isArray(usr) ? usr : []);
    }).catch(() => mostrarToast('Error cargando admin', 'error'));
  };

  useEffect(() => { cargar(); }, [token]);

  const toggle = async (id, tipo) => {
    const r = await fetch(`${API}/api/admin/reportes/${id}/${tipo}`, {
      method: 'PATCH',
      headers: headersAuth(token)
    });
    if (r.ok) { mostrarToast('Actualizado'); cargar(); }
  };

  const verificar = async (id) => {
    const r = await fetch(`${API}/api/admin/usuarios/${id}/verificar`, {
      method: 'PATCH',
      headers: headersAuth(token)
    });
    if (r.ok) { mostrarToast('Usuario verificado'); cargar(); }
  };

  const maxBar = resumen
    ? Math.max(resumen.reportes, resumen.encontrados, resumen.activos, resumen.usuarios, 1)
    : 1;

  return (
    <div className="admin-panel">
      <h3>Panel de administración</h3>
      {resumen && (
        <>
          <div className="admin-stats">
            <span>👥 {resumen.usuarios} usuarios</span>
            <span>📋 {resumen.reportes} reportes</span>
            <span>✅ {resumen.encontrados} encontrados</span>
            <span>⚠️ {resumen.denuncias} denuncias</span>
          </div>
          <div className="admin-chart" aria-label="Resumen visual">
            {[
              ['Activos', resumen.activos, 'var(--coral)'],
              ['Encontrados', resumen.encontrados, 'var(--success)'],
              ['Usuarios', resumen.usuarios, 'var(--violet)'],
              ['Denuncias', resumen.denuncias, 'var(--warning)'],
            ].map(([label, val, color]) => (
              <div key={label} className="admin-chart-row">
                <span className="admin-chart-label">{label}</span>
                <div className="admin-chart-bar-wrap">
                  <div
                    className="admin-chart-bar"
                    style={{ width: `${(val / maxBar) * 100}%`, background: color }}
                  />
                </div>
                <span className="admin-chart-val">{val}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <h4>Moderar reportes</h4>
      <div className="admin-list">
        {reportes.slice(0, 15).map((r) => (
          <div key={r._id} className="admin-row">
            <span>{r.nombre} {r.oculto && '(oculto)'}</span>
            <div>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => toggle(r._id, 'oculto')}>👁️</button>
              <button type="button" className="btn btn-sm btn-teal" onClick={() => toggle(r._id, 'destacado')}>⭐</button>
            </div>
          </div>
        ))}
      </div>
      <h4>Usuarios</h4>
      <div className="admin-list">
        {usuarios.slice(0, 10).map((u) => (
          <div key={u._id} className="admin-row">
            <span>{u.nombre} {u.verificado && '✓'}</span>
            {!u.verificado && (
              <button type="button" className="btn btn-sm btn-primary" onClick={() => verificar(u._id)}>Verificar</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
