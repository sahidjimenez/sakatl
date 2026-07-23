# Estado del Proyecto — Sakatl (App de ejercicio colaborativa)

Última actualización: 2026-07-23

## Estado general
🟡 En progreso

## Por agente

| Agente | Estado | Tarea actual | Bloqueadores |
|--------|--------|--------------|--------------|
| UX/UI | 🟡 | Home diseñado en Claude Design; falta diseñar "Fitness App" (rutinas) | — |
| Backend | 🟡 | API de ejercicios lista (`/api/exercises`); falta DB/auth para rutinas | Falta decidir DB/auth (candidato Supabase) |
| Frontend | 🟡 | Home + biblioteca de ejercicios implementados; falta la pantalla de rutinas | — |
| Fullstack | 🔴 | — | — |
| Tester | 🔴 | — | — |
| Deploy | 🔴 | — | — |

## Hitos

- [x] Brief aprobado
- [x] Diseño de Home completado (Claude Design)
- [ ] Diseño de "Fitness App" (rutinas) completado
- [x] Design tokens documentados (`figma.md`)
- [ ] API contract definido (Backend) — solo cubre ejercicios por ahora
- [ ] Schema DB creado (Backend)
- [x] Home implementado (Frontend) — `app/page.tsx`, `app/home.css`
- [x] Biblioteca de ejercicios implementada (Frontend) — `/ejercicios`
- [x] Social share (OG image) + PWA (manifest, iconos, service worker)
- [ ] Pantalla de rutinas implementada (Frontend)
- [ ] API implementada (Backend) — para rutinas/usuarios
- [ ] Integración completa (Fullstack)
- [ ] Tests aprobados (Tester)
- [ ] Deploy a staging (Deploy)
- [ ] Deploy a producción (Deploy)

## Notas
- Dataset completo de ejercicios (`hasaneyldrm/exercises-dataset`) copiado a
  `public/exercises/` (~154MB: JSON + 1,324 thumbnails + 1,324 GIFs).
- Biblioteca de ejercicios (`/ejercicios`) con búsqueda, filtros por músculo
  y equipo, y detalle con animación GIF + instrucciones en español.
  Servidor: `lib/exercises.ts` (carga y filtra `exercises.json` en memoria),
  `app/api/exercises` (lista paginada) y `app/api/exercises/[id]` (detalle).
- Nombre/categoría/equipo/objetivo del dataset están solo en inglés; la
  búsqueda también revisa `instructions.es` como respaldo para que términos
  en español (ej. "pecho", "glúteos") encuentren resultados.
- **Social share + PWA**: `app/opengraph-image.tsx` genera la tarjeta que se
  ve al compartir el link (1200×630, logo + "Tu rutina. Su ritmo."). Favicon
  (`app/icon.tsx`) y apple-touch-icon (`app/apple-icon.tsx`) usan el mismo
  glifo de mancuerna en verde sobre fondo oscuro. `app/manifest.ts` define el
  manifest PWA (instalable, `display: standalone`); sus iconos 192/512
  (`public/icons/`) están pre-generados con `scripts/generate-icons.mjs`
  (correr de nuevo si cambia el diseño del icono). Service worker mínimo en
  `public/sw.js` (cache-first para assets estáticos, network-first con
  fallback a cache para el resto) registrado desde `app/register-sw.tsx`.
- `npm run build` y `npm run lint` verificados sin errores.
