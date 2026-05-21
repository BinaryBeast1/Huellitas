import { useEffect, useState } from 'react';
import { API, DEMO_EMAIL, DEMO_PASSWORD } from '../config';

export default function LandingPage({
  modoRegistro, setModoRegistro, usuario, setUsuario, onLogin, onRegistro,
  onProbarDemo, onExplorarMapa, cargandoDemo,
}) {
  const [stats, setStats] = useState({ total: 0, encontrados: 0, activos: 0 });

  useEffect(() => {
    fetch(`${API}/api/pets/stats/public`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const scrollLogin = () => document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' });

  const pctReencuentro = stats.total > 0
    ? Math.round((stats.encontrados / stats.total) * 100)
    : null;

  return (
    <>
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <span className="landing-badge">Plataforma comunitaria para mascotas perdidas</span>
          <h1>Reúne familias con sus <span>mascotas</span></h1>
          <p>Mapa en vivo, alertas en tu zona, matching inteligente y contacto seguro entre vecinos.</p>
          <div className="landing-cta">
            <button type="button" className="btn btn-primary btn-lg" onClick={scrollLogin}>Comenzar gratis</button>
            <button type="button" className="btn btn-teal btn-lg" onClick={onProbarDemo} disabled={cargandoDemo}>
              {cargandoDemo ? 'Entrando…' : '⚡ Probar demo'}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={onExplorarMapa}>Explorar mapa</button>
          </div>
          <div className="landing-metrics">
            <div><strong>{stats.total || '—'}</strong><span>Reportes</span></div>
            <div><strong>{stats.encontrados || '—'}</strong><span>Reencuentros</span></div>
            <div><strong>{stats.activos || '—'}</strong><span>Casos activos</span></div>
            {pctReencuentro != null && (
              <div><strong>{pctReencuentro}%</strong><span>Tasa de éxito</span></div>
            )}
          </div>
        </div>
      </section>

      <section className="landing-story">
        <div className="story-card story-success">
          <span className="story-badge">Historia real</span>
          <h3>Bobby volvió a casa en 24 horas</h3>
          <p>Un avistamiento en el mapa y el matching con otro reporte permitieron contactar al dueño el mismo día.</p>
          <div className="story-steps">
            <span>📢 Reporte</span>
            <span>→</span>
            <span>🗺️ Mapa</span>
            <span>→</span>
            <span>✅ Encontrado</span>
          </div>
        </div>
        <div className="story-card story-trust">
          <h3>Tu privacidad importa</h3>
          <ul>
            <li>No mostramos tu teléfono en público</li>
            <li>Mensajería interna entre usuarios registrados</li>
            <li>Denuncias y moderación para la comunidad</li>
          </ul>
        </div>
      </section>

      <section className="landing-flows">
        <h2>¿Qué necesitas hacer?</h2>
        <div className="flow-cards">
          <article className="flow-card flow-perdi">
            <span className="flow-icon">😿</span>
            <h3>Perdí mi mascota</h3>
            <p>Publica en 3 pasos: datos, ubicación en el mapa y foto. Recibe alertas cerca de ti.</p>
          </article>
          <article className="flow-card flow-vi">
            <span className="flow-icon">👀</span>
            <h3>Vi una mascota</h3>
            <p>Registra un avistamiento rápido y ayuda sin ser el dueño.</p>
          </article>
        </div>
      </section>

      <section className="landing-features" aria-labelledby="features-title">
        <div className="features-intro">
          <div>
            <span className="section-eyebrow">Herramientas</span>
            <h2 id="features-title">Todo lo que necesitas</h2>
            <p className="features-sub">Mapa, alertas, mensajes y más — en un solo lugar.</p>
          </div>
          <span className="features-hint" aria-hidden>Desliza →</span>
        </div>
        <div className="features-scroll">
          <div className="features-track">
            {[
              ['🗺️', 'Mapa en vivo', 'Explora reportes geolocalizados', 'accent-coral'],
              ['🔍', 'Búsqueda avanzada', 'Filtros por zona, raza y nombre', 'accent-teal'],
              ['💬', 'Contacto seguro', 'Mensajería interna sin exponer datos', 'accent-violet'],
              ['🔔', 'Alertas locales', 'Avisos cuando hay casos cerca', 'accent-pink'],
              ['🤝', 'Matching inteligente', 'Compara fotos y sugiere coincidencias', 'accent-gold'],
              ['✅', 'Cierre de casos', 'Marca encontrado con historial', 'accent-sky'],
            ].map(([icon, title, desc, accent]) => (
              <article key={title} className={`feature-card ${accent}`}>
                <span className="feature-card-icon">{icon}</span>
                <h4>{title}</h4>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-testimonials">
        <h2>Lo que dice la comunidad</h2>
        <div className="testimonial-grid">
          <blockquote>«Encontramos a Luna en 48 h gracias al mapa y un avistamiento.» <cite>— María, Providencia</cite></blockquote>
          <blockquote>«La mensajería interna nos dio tranquilidad al contactar al dueño.» <cite>— Carlos, Ñuñoa</cite></blockquote>
          <blockquote>«Huellitas es lo que los grupos de Facebook deberían ser.» <cite>— VetCare Santiago</cite></blockquote>
        </div>
      </section>

      <section className="landing-pricing">
        <h2>Empieza hoy</h2>
        <div className="pricing-grid pricing-single">
          <div className="price-card price-featured">
            <span className="price-tag">MVP completo</span>
            <h3>Comunidad</h3>
            <p className="price">$0</p>
            <ul>
              <li>Reportes y avistamientos ilimitados</li>
              <li>Mapa, feed cercano y matching</li>
              <li>Mensajería segura y PWA</li>
              <li>Panel de administración</li>
            </ul>
            <button type="button" className="btn btn-primary" onClick={scrollLogin}>Crear cuenta gratis</button>
            <button type="button" className="btn btn-teal" style={{ marginTop: 8, width: '100%' }}
              onClick={onProbarDemo} disabled={cargandoDemo}>
              {cargandoDemo ? 'Cargando demo…' : 'Probar sin registrarte (demo)'}
            </button>
          </div>
        </div>
      </section>

      <section className="auth-page" id="login-section">
        <div className="auth-hero">
          <div className="auth-hero-content">
            <h2>Tu mascota merece volver a casa</h2>
            <p>Mapa interactivo, reportes en 3 pasos y herramientas para toda la comunidad.</p>
            <div className="auth-stats">
              <div className="auth-stat"><strong>🔒</strong><span>Sesión segura</span></div>
              <div className="auth-stat"><strong>🗺️</strong><span>Mapa + alertas</span></div>
              <div className="auth-stat"><strong>PWA</strong><span>Instala en el celular</span></div>
            </div>
          </div>
        </div>
        <div className="auth-form-wrap">
          <div className="auth-card" id="login">
            <h2>{modoRegistro ? 'Crear cuenta' : 'Bienvenido'}</h2>
            <p className="subtitle">
              {modoRegistro ? 'Únete a Huellitas' : 'Inicia sesión o usa la cuenta demo'}
            </p>
            {!modoRegistro && (
              <div className="demo-credentials">
                <p><strong>Demo:</strong> {DEMO_EMAIL}</p>
                <p>Contraseña: <code>{DEMO_PASSWORD}</code></p>
                <button type="button" className="btn btn-teal btn-sm" style={{ width: '100%', marginTop: 8 }}
                  onClick={onProbarDemo} disabled={cargandoDemo}>
                  Entrar con demo automática
                </button>
              </div>
            )}
            <form onSubmit={modoRegistro ? onRegistro : onLogin}>
              {modoRegistro && (
                <div className="form-group">
                  <label>Tu nombre</label>
                  <input type="text" required onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })} />
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <input type="email" required onChange={(e) => setUsuario({ ...usuario, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input type="password" required onChange={(e) => setUsuario({ ...usuario, password: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {modoRegistro ? 'Registrarme' : 'Entrar'}
              </button>
            </form>
            <p className="form-toggle">
              {modoRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
              <button type="button" onClick={() => setModoRegistro(!modoRegistro)}>
                {modoRegistro ? 'Inicia sesión' : 'Regístrate gratis'}
              </button>
            </p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2026 Huellitas · Proyecto académico · Ingeniería de Software</p>
      </footer>
    </>
  );
}
