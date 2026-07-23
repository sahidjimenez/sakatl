# Brief del Proyecto: Sakatl (App de ejercicio colaborativa)

## Descripción
Sakatl es una app de rutinas de ejercicio colaborativas: cada usuario arma su
propia rutina (series simples, bi-series o tri-series), la sigue a su ritmo,
y puede unirse a rutinas creadas por otros usuarios sin depender de coincidir
en horario. Un asistente (chat) recomienda ejercicios y rutinas completas.

## Usuarios objetivo
Personas que entrenan por su cuenta pero quieren seguir rutinas de otros
(amigos, comunidad) y llevar un registro simple de series, peso y
repeticiones sin depender de hojas sueltas o notas del celular.

## Funcionalidades principales
1. Armar rutinas con ejercicios sueltos, bi-series y tri-series (sin descanso entre ellos)
2. Marcar cada serie durante la sesión (check + peso + repeticiones)
3. Seguir rutinas creadas por otros usuarios, cada quien a su paso
4. Asistente que recomienda ejercicios/rutinas por chat
5. Landing pública (Home) para atraer y convertir usuarios nuevos
6. Biblioteca de ejercicios con búsqueda y filtros (`/ejercicios`)

## Flujos de usuario críticos
1. Landing → crear cuenta / crear rutina / ver rutinas de la comunidad
2. Armar una rutina (agregar ejercicios, agrupar en bi/tri-series, reordenar)
3. Sesión de entrenamiento: marcar series, anotar peso/reps
4. Unirse a la rutina de otro usuario y seguir su progreso

## Stack acordado
Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.
Base de datos/backend: por definir (candidato: Supabase, como en el resto de
proyectos — ver `../../shared/stack.md`).

## Fuente de datos de ejercicios
`public/exercises/` contiene una copia completa del repo
[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset):
1,324 ejercicios (`data/exercises.json`), thumbnails (`images/`) y GIFs de
animación (`videos/`), con instrucciones en 10 idiomas. Atribución de
medios: © Gym visual (ver `public/exercises/NOTICE.md`).

Se sirve mediante `lib/exercises.ts` (carga y filtra el JSON en memoria en el
servidor) y dos rutas API:
- `GET /api/exercises?q=&category=&equipment=&offset=&limit=` — lista paginada
- `GET /api/exercises/[id]` — detalle (instrucciones en español + GIF)

La página `/ejercicios` (`app/ejercicios/`) es la biblioteca buscable —
usada hoy de forma independiente, y será el picker de ejercicios de la
futura pantalla "Fitness App".

## Diseño (Claude Design)
Proyecto: "App de ejercicio colaborativa" — ver `figma.md`.

## Fecha límite
Sin definir.

## Notas adicionales
- Home.dc.html (landing pública) está implementado en `app/page.tsx` + `app/home.css`.
- Los CTA de la landing ("Crear mi rutina", "Entrar", "Empezar") apuntan a
  `/app`, que hoy es solo un placeholder — la pantalla real ("Fitness App.dc.html"
  en el proyecto de diseño) todavía no está implementada.
