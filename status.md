# Estado del Proyecto — Sakatl (App de ejercicio colaborativa)

Última actualización: 2026-07-24

## Estado general
🟡 En progreso

## Por agente

| Agente | Estado | Tarea actual | Bloqueadores |
|--------|--------|--------------|--------------|
| UX/UI | 🟡 | Home diseñado en Claude Design; falta diseñar "Fitness App" (rutinas) | — |
| Backend | 🟡 | API de ejercicios lista (`/api/exercises`); DB/auth provisionados (Neon + Clerk), falta el schema de rutinas/usuarios | — |
| Frontend | 🟡 | Home + biblioteca de ejercicios implementados; falta la pantalla de rutinas | — |
| Fullstack | 🔴 | — | — |
| Tester | 🔴 | — | — |
| Deploy | 🔴 | — | — |

## Hitos

- [x] Brief aprobado
- [x] Diseño de Home completado (Claude Design)
- [ ] Diseño de "Fitness App" (rutinas) completado
- [x] Design tokens documentados (`figma.md`)
- [x] API contract definido (Backend) — ejercicios + rutinas
- [x] DB/auth decididos y provisionados (Neon Postgres + Clerk, vía Vercel Marketplace)
- [x] Schema DB creado (Backend) — usuarios/rutinas/sesiones
- [x] Home implementado (Frontend) — `app/page.tsx`, `app/home.css`
- [x] Biblioteca de ejercicios implementada (Frontend) — `/ejercicios`
- [x] Social share (OG image) + PWA (manifest, iconos, service worker)
- [x] Pantalla de rutinas implementada (Frontend) — rediseñada según mockup de referencia del usuario (sidebar/bottom-tabs, dashboard "Inicio")
- [x] API implementada (Backend) — para rutinas/usuarios
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
- **DB/auth**: se evaluó Supabase (un solo proveedor) vs. Neon + Clerk (mejor
  pieza por pieza); se eligió **Neon + Clerk**. Ambos provisionados vía
  `vercel integration add` (Vercel Marketplace) y conectados al proyecto —
  env vars en `.env.local` (`DATABASE_URL`, `CLERK_SECRET_KEY`,
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, etc.), no hardcodeadas.
  - `lib/db.ts`: cliente Drizzle + `pg` con inicialización lazy y
    `attachDatabasePool` (patrón recomendado para Vercel Fluid Compute).
    Todavía sin schema — es el siguiente hito ("Schema DB creado").
  - `proxy.ts`: `clerkMiddleware` protegiendo todo excepto `/`, `/ejercicios`,
    `/api/exercises` y `/sign-in`/`/sign-up` (patrón "protected-first").
    `/app` ya requiere login (hoy solo redirige a sign-in porque el
    placeholder no tiene datos reales que proteger).
  - `app/layout.tsx`: envuelto en `<ClerkProvider>` dentro de `<body>`.
  - Nota de Clerk: `createRouteMatcher` en middleware está marcado como
    deprecado a favor de checks por recurso (`await auth()` en cada
    página/route). Se mantuvo el gate en `proxy.ts` por ahora (documentado y
    funcional); cuando se implemente la pantalla de rutinas con datos reales,
    agregar el check `auth()` dentro de esas páginas/rutas en vez de confiar
    solo en el path-matching.
  - **Sign-in/sign-up propios**: `app/sign-in/[[...sign-in]]/page.tsx` y
    `app/sign-up/[[...sign-up]]/page.tsx` (componentes `<SignIn />`/
    `<SignUp />` de Clerk, embebidos en nuestras rutas). Antes, sin login
    propio configurado, Clerk redirigía al dominio hosteado
    (`*.clerk.accounts.dev`); ahora se queda en el propio sitio. Se
    configuró vía `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` y
    `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` — en `.env.local` y también
    en Vercel (production/preview/development) para que el comportamiento
    sea igual en deploy.
  - **Estilo**: `lib/clerk-appearance.ts` themea `<SignIn />`/`<SignUp />`
    (y a futuro `<UserButton />`, etc.) con los tokens de `figma.md`/
    `app/home.css` (fondo `#0d0f12`, superficie `#1c2026`, botón primario
    `#22c55e`/`#08150d`, acentos `#4ade80`), vía el prop `appearance` de
    `ClerkProvider` (`variables` + `elements` con clases Tailwind). Falta:
    revisar visualmente en navegador cuando el diseño de "Fitness App" esté
    listo, y afinar detalles finos si no calzan del todo con ese diseño.
  - El botón "Entrar" del nav (`app/HomeNav.tsx`) ahora apunta directo a
    `/sign-in` (antes iba a `/app`, que igual redirigía ahí — pero ahora es
    explícito y sin el salto intermedio). `fallbackRedirectUrl="/app"` en
    `<SignIn/>`/`<SignUp/>` para que, logueado o recién logueado, termines
    en la app y no en el home (antes bajaba al default de Clerk).
- **App de rutinas** (reemplaza el placeholder de `/app`), consumiendo
  `lib/routines.ts` directo desde Server Components + Server Actions
  (`lib/actions/routines.ts`) — no pasa por las rutas REST (esas quedan
  para un futuro cliente externo/mobile). El usuario compartió un mockup de
  referencia (dashboard estilo "Trazo") y pidió que `/app` se vea y funcione
  así — se adaptó a la marca Sakatl, no es un rebrand.
  - **Nav**: `app/app/layout.tsx` + `app/app/AppNav.tsx` — sidebar fijo en
    desktop, bottom-tabs en mobile (breakpoint `md`), 5 secciones: Inicio,
    Rutinas, Registro, Comunidad (badge "IA" — hueco para el asistente que
    menciona `brief.md`, sin implementar todavía), Perfil. `<UserButton />`
    en el sidebar (desktop) y en Perfil (mobile).
  - **`app/app/page.tsx` (Inicio)**: saludo con nombre real (Clerk
    `currentUser()`), racha 🔥 (días consecutivos con sesión completada),
    tira de 7 días de la semana con punto verde en los días con rutina
    agendada, tarjeta "Tu progreso" (entrenamientos/volumen en
    kg/tiempo — agregado real desde `workout_sessions`+`set_logs` de esta
    semana calendario) con barra de "Meta semanal", tarjeta "Rutina de hoy"
    (según `scheduledDays`) con botón para arrancar sesión, y "Próximos
    entrenamientos" (próximos días con algo agendado).
  - **Nuevo en el modelo de datos**: `routines.scheduledDays` (int[],
    1=lunes..7=domingo, elegible en `RoutineForm`) y `users.weeklyGoal`
    (configurable en `/app/perfil`) — decisiones tomadas con el usuario
    (día fijo por rutina + meta editable por usuario, ambas "recomendadas").
  - **`/app/rutinas`**, **`/app/comunidad`**: el grid de "mis rutinas" y de
    comunidad que antes vivían juntos en el dashboard viejo, ahora cada uno
    en su propia sección del nav.
  - **`/app/registro`**: historial de todas las sesiones (todas las
    rutinas), con duración.
  - **`/app/perfil`**: datos de cuenta + editar meta semanal.
  - La franja de racha del mockup mobile ("🔥 12" + campana) se implementó
    sin la campana (no hay sistema de notificaciones — no tenía sentido
    poner un ícono decorativo sin función real).
  - Build y lint verificados sin errores; probé sin sesión que todas las
    rutas de `/app/*` redirigen a `/sign-in`. El log del dev server mostró
    un `GET /app 200` real durante las pruebas (sesión propia del usuario
    aparentemente activa), sin errores 500 — buena señal, pero falta
    confirmación visual explícita del usuario.
  - Falta: crear cuentas/sign-in reales de prueba y construir la API/UI de
    rutinas sobre este schema.
- **Schema DB** (`lib/db/schema.ts`, aplicado a Neon con `npm run db:push`):
  - `users` — espejo mínimo de Clerk (id = clerk user id), poblado lazy en el
    primer request autenticado (falta ese paso de upsert).
  - `routines` — dueño (`ownerId`) + `originalRoutineId` opcional: al
    "seguir" la rutina de otro usuario se crea una **copia propia** que
    apunta al original (da crédito, pero el progreso de cada quien es
    independiente — no hay edición en vivo compartida).
  - `routine_blocks` + `routine_block_exercises` — un bloque es un ejercicio
    suelto, bi-serie o tri-serie; cada ejercicio del bloque define sets/reps/
    peso **planeados**. `exerciseId` referencia el dataset de
    `public/exercises/` (no es FK en DB, vive en el JSON).
  - `workout_sessions` + `set_logs` — cada vez que alguien entrena queda una
    sesión, y cada set marcado durante el entrenamiento (peso+reps+check
    reales) se loguea aparte de lo planeado, para comparar plan vs. real e
    historial.
- **API de rutinas** (`lib/routines.ts` + rutas bajo `app/api/routines` y
  `app/api/sessions`), siguiendo el mismo estilo REST que `/api/exercises`:
  - `GET/POST /api/routines` — mis rutinas (`?scope=mine`, default) o
    comunidad (`?scope=community`, paginada, excluye las propias)
  - `GET/PATCH/DELETE /api/routines/[id]` — el detalle es visible para
    **cualquier usuario logueado** (no solo el dueño, para poder
    descubrir/seguir rutinas ajenas); editar/borrar sigue restringido al
    dueño
  - `POST /api/routines/[id]/follow` — crea la copia propia (con
    `originalRoutineId` apuntando a la seguida) según lo que definimos
  - `GET/POST /api/routines/[id]/sessions` — historial / iniciar sesión de
    entrenamiento (solo el dueño de esa rutina)
  - `GET /api/sessions/[id]`, `PATCH` (marcar completada), `POST
    /api/sessions/[id]/sets` (upsert de un set: check + peso + reps)
  - Toda mutación valida ownership server-side (no confía solo en
    `proxy.ts`, siguiendo la recomendación de Clerk sobre checks por
    recurso). `ensureUser()` sincroniza lazy la fila en `users` desde Clerk
    en cada request autenticado.
  - Decisión de producto tomada por mí, a revisar: por ahora **no hay
    privacidad** — cualquier usuario logueado puede ver el detalle de
    cualquier rutina de otro (necesario para "ver rutinas de la comunidad" /
    seguir). Si en algún momento se quiere que las rutinas sean privadas por
    default, hay que agregar un flag de visibilidad.
  - `npm run build` y `npm run lint` verificados; probé en dev que
    `/api/routines` (GET y POST) devuelve 307 (redirect a sign-in) sin
    sesión — falta probar el flujo completo con una cuenta real logueada.
  - Falta: UI de rutinas (Frontend) que consuma esta API.
