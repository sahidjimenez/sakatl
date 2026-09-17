# Ejercicios de la comunidad en Neon

## Base de datos

La función utiliza la conexión `DATABASE_URL` existente. No necesita Supabase ni claves de almacenamiento adicionales.

La migración `scripts/migrations/002-custom-exercises.sql` crea dos tablas:

- `custom_exercises`: autor (ID de Clerk), ficha completa y fecha.
- `exercise_media`: GIF de hasta 3 MB, almacenado como `bytea`, separado de la ficha para que las búsquedas no descarguen imágenes.

Ambas tablas tienen RLS activado; el servidor usa el rol propietario ya configurado. El navegador no recibe permisos SQL. La creación y edición de la ficha y del GIF ocurren en una transacción: se guardan ambos o ninguno. Los GIF se sirven mediante una ruta pública con caché; al reemplazarlos se cambia la versión de su URL.

Desde **Perfil → Mis ejercicios creados**, el autor puede editar la ficha, reemplazar el GIF o eliminar el ejercicio. Las operaciones verifican la propiedad en el servidor. Eliminar agrega `deleted_at` al registro JSON existente (sin migración adicional): lo oculta de la biblioteca y el perfil, pero conserva la ficha y el GIF para las rutinas y sesiones que ya lo utilizan.

La migración se aplicó a la base indicada por `.env.local` durante esta implementación. Si producción usa otra rama/base de Neon, ejecuta el mismo SQL allí antes de desplegar. Es repetible y no cambia rutinas ni ejercicios existentes. Si el servidor usa un rol distinto al propietario, configura permisos y políticas específicos para ese rol antes de habilitar la función.

## Activación

Con `DATABASE_URL` configurado, la función queda habilitada de forma predeterminada. Publica los cambios de la aplicación para usarla en línea. Opcionalmente, `CUSTOM_EXERCISES_ENABLED=false` deshabilita la creación y la consulta de ejercicios nuevos; no es necesario agregar ninguna variable para activarla.

## Uso

1. Con sesión iniciada, pulsa **Crear ejercicio nuevo** en la biblioteca o en un espacio vacío de tu rutina. Se abre un modal en la misma página; el borrador de la rutina se conserva.
2. Inicia sesión. Publicar requiere cuenta; los invitados pueden consultar y usar todos los ejercicios publicados.
3. Completa nombre, descripción, grupo muscular, equipo y pasos (uno por línea, hasta 15 de 500 caracteres).
4. Selecciona un video de hasta 8 segundos/50 MB compatible con el navegador (MP4, WebM o MOV), o 1–12 imágenes JPG/PNG/WebP de hasta 10 MB cada una. Puedes reordenar las imágenes con la flecha hacia arriba. Si un MOV no funciona, usa MP4 o WebM.
5. Pulsa **Generar vista previa GIF**. La conversión ocurre en el navegador a 320 × 320, 8 cuadros por segundo para video, sin audio. Solo se envía el GIF. Varias imágenes forman una secuencia; una imagen produce un GIF estático. Puedes cancelar la conversión.
6. Revisa la vista previa y publica. Desde una rutina, el modal se cierra y el ejercicio se agrega automáticamente al espacio seleccionado. Desde la biblioteca, se muestra su ficha. El ejercicio estará disponible en biblioteca, rutinas, sesiones, estadísticas y herramientas del asistente.

## Comprobaciones

- Compilación de producción y revisión TypeScript/ESLint.
- Conversión real en navegador: video, secuencia y foto; progreso, tipo inválido y cancelación.
- Formulario: campos, vista previa y envío multipart; navegación pública y rechazo de creación sin sesión.
- Persistencia de ficha y GIF en Neon: usar una transacción de prueba y revertirla para no publicar ejercicios de prueba.

Los archivos originales no se conservan. El tamaño de los GIF cuenta como almacenamiento de la base de datos; el catálogo consulta solo las fichas. Para una biblioteca de mucho mayor volumen puede trasladarse la tabla de medios a un servicio de objetos conservando las rutas públicas.

Referencias: [gifenc](https://github.com/mattdesl/gifenc), [roles de Neon](https://neon.com/docs/manage/roles).
