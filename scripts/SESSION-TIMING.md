# Tiempo persistente de entrenamientos

Aplicar `scripts/migrations/003-session-timing.sql` antes de desplegar. Es repetible; se aplicó a la conexión de `.env.local`. Si producción usa otra base, aplicarla allí también.

Perfil permite elegir 5, 10, 15 (predeterminado), 20, 30 o 60 minutos sin registrar series, o desactivar la pausa automática. El cálculo se limita al último registro más ese margen, incluso con la aplicación cerrada. No depende de un proceso en segundo plano: la pausa se materializa al consultar o modificar la sesión.

Las sesiones abiertas antiguas se migran pausadas, con una estimación basada en la última serie más 15 minutos. Las completadas conservan su duración. La duración puede corregirse en el detalle sin alterar series, inicio o fecha de finalización. Corregir una sesión abierta deja su contador pausado.

Retomar abre la sesión guardada; el botón Continuar reanuda el contador. Empezar una rutina con una sesión pendiente reutiliza esa sesión.

Validación del cálculo: `npx tsx scripts/test-session-clock.ts`.
