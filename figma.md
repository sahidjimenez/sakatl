# Referencias de diseño — Sakatl (App de ejercicio colaborativa)

> Diseñado en Claude Design (no Figma) — se mantiene este archivo por
> convención con el resto de proyectos.

## Archivo principal
- URL: https://claude.ai/design/p/da521112-d829-47e5-8906-460b3cbe2b0e
- Nombre en Claude Design: "App de ejercicio colaborativa"
- projectId: `da521112-d829-47e5-8906-460b3cbe2b0e`

## Archivos del proyecto de diseño

| Archivo | Descripción | Estado |
|---|---|---|
| `Home.dc.html` | Landing pública ("Sakatl") | ✅ Implementado en `app/page.tsx` + `app/home.css` |
| `Fitness App.dc.html` | App real (crear/seguir rutinas, vistas mobile/desktop) | 🔴 Pendiente |
| `exercise-library.js` | Muestra recortada del dataset de ejercicios (solo prototipo) | Reemplazada por el dataset completo en `public/exercises/` |
| `image-slot.js`, `support.js`, `ios-frame.jsx` | Runtime propio de Claude Design (dc-runtime) para la preview | No aplica a producción — no se portó |

## Pantallas principales

| Pantalla | Archivo fuente | Ruta implementada |
|----------|--------|--------------|
| Home | `Home.dc.html` | `/` (`app/page.tsx`) |
| Fitness App | `Fitness App.dc.html` | `/app` (placeholder por ahora) |

## Design Tokens (extraídos de Home.dc.html)
- Fondo: `#0d0f12`
- Superficie/tarjetas: `#1c2026`
- Bordes: `#2a2f37` / `#23272e`
- Texto principal: `#f1f3f4`
- Texto secundario: `#9099a3`
- Texto terciario: `#6b7280`
- Acento (verde): `#4ade80` (texto) / `#22c55e` (botón primario) / `#08150d` (texto sobre botón primario)
- Tipografía: `-apple-system, system-ui, sans-serif`
- Archivo: `design-tokens/tokens.json` (pendiente de exportar formalmente)

## Notas
- El Home no usa el dataset de ejercicios directamente — solo lo usará la
  futura pantalla "Fitness App" (ver `brief.md`).
- La foto del bloque "El asistente" (`image-slot#photo-home` en el diseño)
  no tenía una imagen real asignada; se reemplazó por un placeholder visual
  hasta contar con una fotografía real.
