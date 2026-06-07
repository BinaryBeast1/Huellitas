# Huellitas 🐾

Plataforma comunitaria para reunir familias con mascotas extraviadas.

## MVP + Sprints (HU5–HU20)

Todas las historias del backlog siguen activas: mapa, reportar (ubicación, descripción, foto), filtros, contacto, perfil, sesión, notificaciones, encontrado, eliminar.

## Nuevas capacidades comerciales

- Landing con métricas, testimonios y planes
- Flujos **Perdí mi mascota** / **Vi una mascota**
- Mensajería interna segura (HU5 mejorada)
- Matching de reportes similares + timeline del caso
- Alertas por zona (HU18) en perfil
- Mapa con clusters y marcadores distintos
- Compartir WhatsApp (difusión + chat directo al dueño con teléfono) + QR + copiar enlace `/caso/:id`
- Vincular avistamientos a reportes de pérdida
- Geocodificación al marcar en mapa
- Chat con actualización automática
- Denuncias y moderación automática
- Panel admin (verificar usuarios, ocultar/destacar reportes)
- PWA instalable

## Arranque

```bash
# Backend
cd huellitas-backend
npm install
# .env con MONGO_URI y JWT_SECRET
npm start

# Frontend
cd frontend-huellitas
npm install
npm run dev
```

Opcional: `frontend-huellitas/.env` con `VITE_API_URL=http://localhost:3000`

## Admin

Tras registrarte, en MongoDB o con:

```bash
cd huellitas-backend
node scripts/crearAdmin.js tu@email.com
```

Reinicia sesión para ver la pestaña **Admin**.
