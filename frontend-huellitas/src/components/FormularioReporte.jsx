import { useState } from 'react';
import MiniMapaBorrador from './MiniMapaBorrador';

const VACIO = {
  nombre: '', especie: 'Perro', raza: '', color: '',
  descripcion: '', latitud: '', longitud: '', ubicacionNombre: '',
  foto: null, tipoReporte: 'perdida', recompensa: ''
};

export { VACIO };

export default function FormularioReporte({
  editandoId, nuevoReporte, setNuevoReporte, setEditandoId, onSubmit, tipoFlujo, setTipoFlujo
}) {
  const [paso, setPaso] = useState(1);
  const esWizard = !editandoId;

  const validarPaso = (n) => {
    if (n === 1) return !!(nuevoReporte.nombre?.trim() && nuevoReporte.descripcion?.trim());
    if (n === 2) return !!(nuevoReporte.ubicacionNombre?.trim() && nuevoReporte.latitud && nuevoReporte.longitud);
    return true;
  };

  const siguiente = () => {
    if (validarPaso(paso)) setPaso((p) => Math.min(p + 1, 3));
  };

  const anterior = () => setPaso((p) => Math.max(p - 1, 1));

  const previewFoto = nuevoReporte.foto
    ? URL.createObjectURL(nuevoReporte.foto)
    : null;

  if (!esWizard) {
    return (
      <div className="report-form-card">
        <h3>✏️ Editar reporte</h3>
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }}
          onClick={() => { setEditandoId(null); setNuevoReporte({ ...VACIO }); setPaso(1); }}>
          Cancelar
        </button>
        <FormularioCompleto
          nuevoReporte={nuevoReporte}
          setNuevoReporte={setNuevoReporte}
          tipoFlujo={tipoFlujo}
          onSubmit={onSubmit}
          editandoId={editandoId}
        />
      </div>
    );
  }

  return (
    <div className="report-form-card report-wizard">
      <h3>Publicar en 3 pasos</h3>

      <div className="flow-toggle">
        <button
          type="button"
          className={`flow-btn ${tipoFlujo === 'perdida' ? 'active' : ''}`}
          onClick={() => { setTipoFlujo('perdida'); setNuevoReporte((r) => ({ ...r, tipoReporte: 'perdida' })); }}
        >
          😿 Perdí mi mascota
        </button>
        <button
          type="button"
          className={`flow-btn ${tipoFlujo === 'avistamiento' ? 'active' : ''}`}
          onClick={() => { setTipoFlujo('avistamiento'); setNuevoReporte((r) => ({ ...r, tipoReporte: 'avistamiento' })); }}
        >
          👀 Vi una mascota
        </button>
      </div>

      <div className="wizard-steps" aria-label="Progreso">
        {['Mascota', 'Ubicación', 'Publicar'].map((label, i) => {
          const n = i + 1;
          return (
            <div key={label} className={`wizard-step ${paso === n ? 'active' : ''} ${paso > n ? 'done' : ''}`}>
              <span className="wizard-step-num">{paso > n ? '✓' : n}</span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      <form onSubmit={(e) => { if (paso < 3) { e.preventDefault(); siguiente(); } else onSubmit(e); }}>
        {paso === 1 && (
          <div className="wizard-panel">
            <div className="form-group">
              <label>{tipoFlujo === 'avistamiento' ? 'Nombre o señas' : 'Nombre de la mascota'}</label>
              <input type="text" required value={nuevoReporte.nombre || ''}
                onChange={(e) => setNuevoReporte({ ...nuevoReporte, nombre: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Especie</label>
                <select value={nuevoReporte.especie || 'Perro'}
                  onChange={(e) => setNuevoReporte({ ...nuevoReporte, especie: e.target.value })}>
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Raza</label>
                <input type="text" value={nuevoReporte.raza || ''}
                  onChange={(e) => setNuevoReporte({ ...nuevoReporte, raza: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Color</label>
              <input type="text" value={nuevoReporte.color || ''}
                onChange={(e) => setNuevoReporte({ ...nuevoReporte, color: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea required rows={3} value={nuevoReporte.descripcion || ''}
                placeholder="Collar, tamaño, comportamiento…"
                onChange={(e) => setNuevoReporte({ ...nuevoReporte, descripcion: e.target.value })} />
            </div>
            {tipoFlujo === 'perdida' && (
              <div className="form-group">
                <label>Recompensa opcional ($)</label>
                <input type="number" min="0" value={nuevoReporte.recompensa || ''}
                  onChange={(e) => setNuevoReporte({ ...nuevoReporte, recompensa: e.target.value })} />
              </div>
            )}
          </div>
        )}

        {paso === 2 && (
          <div className="wizard-panel">
            <MiniMapaBorrador
              lat={nuevoReporte.latitud}
              lng={nuevoReporte.longitud}
              tipoReporte={tipoFlujo}
              etiqueta={
                nuevoReporte.ubicacionNombre
                  ? `📍 ${nuevoReporte.ubicacionNombre}`
                  : nuevoReporte.nombre
                    ? `Reporte: ${nuevoReporte.nombre}`
                    : null
              }
            />
            <div className="form-group">
              <label>Nombre del lugar</label>
              <input type="text" required value={nuevoReporte.ubicacionNombre || ''}
                placeholder="Ej: Plaza Ñuñoa"
                onChange={(e) => setNuevoReporte({ ...nuevoReporte, ubicacionNombre: e.target.value })} />
            </div>
            <p className={`form-hint map-hint ${nuevoReporte.latitud ? 'map-hint-ok' : ''}`}>
              {nuevoReporte.latitud
                ? '✓ Pin colocado — haz clic en el mapa grande para moverlo'
                : '👆 Haz clic en el mapa (derecha o abajo) para colocar el pin naranja'}
            </p>
          </div>
        )}

        {paso === 3 && (
          <div className="wizard-panel">
            <div className="wizard-resumen">
              <p><strong>{nuevoReporte.nombre}</strong> · {nuevoReporte.especie}</p>
              <p className="wizard-resumen-lugar">📍 {nuevoReporte.ubicacionNombre}</p>
            </div>
            <div className="form-group">
              <label>Foto (recomendada)</label>
              <label className="file-upload file-upload-lg">
                <input id="input-foto" type="file" accept="image/*"
                  onChange={(e) => setNuevoReporte({ ...nuevoReporte, foto: e.target.files[0] })} />
                {previewFoto ? (
                  <img src={previewFoto} alt="Vista previa" className="foto-preview" />
                ) : (
                  <span>📷 Toca para subir foto</span>
                )}
              </label>
            </div>
          </div>
        )}

        <div className="wizard-nav">
          {paso > 1 && (
            <button type="button" className="btn btn-secondary" onClick={anterior}>Atrás</button>
          )}
          {paso < 3 ? (
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}
              disabled={!validarPaso(paso)}>
              Continuar
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}
              disabled={!validarPaso(2)}>
              Publicar reporte
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function FormularioCompleto({ nuevoReporte, setNuevoReporte, tipoFlujo, onSubmit, editandoId }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>Nombre</label>
        <input type="text" required value={nuevoReporte.nombre || ''}
          onChange={(e) => setNuevoReporte({ ...nuevoReporte, nombre: e.target.value })} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Especie</label>
          <select value={nuevoReporte.especie || 'Perro'}
            onChange={(e) => setNuevoReporte({ ...nuevoReporte, especie: e.target.value })}>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div className="form-group">
          <label>Raza</label>
          <input type="text" value={nuevoReporte.raza || ''}
            onChange={(e) => setNuevoReporte({ ...nuevoReporte, raza: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea required value={nuevoReporte.descripcion || ''}
          onChange={(e) => setNuevoReporte({ ...nuevoReporte, descripcion: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Ubicación</label>
        <input type="text" required value={nuevoReporte.ubicacionNombre || ''}
          onChange={(e) => setNuevoReporte({ ...nuevoReporte, ubicacionNombre: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Foto</label>
        <label className="file-upload">
          <input id="input-foto" type="file" accept="image/*"
            onChange={(e) => setNuevoReporte({ ...nuevoReporte, foto: e.target.files[0] })} />
          {nuevoReporte.foto ? nuevoReporte.foto.name : 'Subir foto'}
        </label>
      </div>
      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
        {editandoId ? 'Actualizar' : 'Guardar'}
      </button>
    </form>
  );
}
