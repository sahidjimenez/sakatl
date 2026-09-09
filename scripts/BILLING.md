# Billing de Sakatl

Implementación actual: beta en modo de prueba, cuenta Stripe MX del propietario. No activar producción cambiando únicamente una bandera.

## Configuración

Variables privadas en `.env.local` (ignorado por Git): `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `STRIPE_TAX_RATE`, `STRIPE_PORTAL_CONFIGURATION`, `STRIPE_WEBHOOK_SECRET`, `APP_URL`, `BILLING_ENABLED=true`, `BILLING_LIVE_READY=false`. La clave publicable es opcional: Checkout se abre por redirección alojada en Stripe. Nunca publicar la clave secreta.

`node scripts/setup-billing.mjs` crea recursos TEST idempotentes y aplica la migración aditiva. Usar esta migración antes de habilitar billing para conservar la capacidad de rutinas de usuarios existentes. El esquema Drizzle también declara las tablas.

`node scripts/listen-billing.mjs` abre el reenvío local, guarda la firma en `.env.local` y requiere el servidor en el puerto 3015. Iniciar el servidor después del listener. Su firma es local; un despliegue necesita la firma del endpoint desplegado.

`node scripts/sync-billing-development.mjs` sincroniza exclusivamente desarrollo en el proyecto Vercel vinculado, con claves TEST. No sincroniza la firma del listener. Un nuevo `vercel env pull` sobrescribe `.env.local`: volver a ejecutar el listener para restaurar la firma local.

## Pruebas

PowerShell: `$env:NODE_OPTIONS='--conditions=react-server'`, después `node node_modules/tsx/dist/cli.mjs scripts/test-billing.mts`. Requiere base configurada, listener y servidor local. Crea y elimina un usuario y cliente propios de prueba. Queda el historial de operaciones simuladas en Stripe. El test cubre cuotas concurrentes, checkout repetido, confirmación pagada, aislamiento del portal, cancelación, eventos duplicados y fuera de orden, conservación de rutinas y firma HTTP. No llama al proveedor de IA.

`npm run build` y `npm run lint` verifican compilación y análisis estático.

## Reglas

- Gratis: 4 rutinas (capacidad previa preservada), 5 mensajes IA y 5 audios por cuenta.
- Pro: cantidad de rutinas sin límite; 40 mensajes y 40 audios por mes calendario UTC, también en anual. No acumulables.
- Precios finales de prueba: 59 MXN mensual y 499 MXN anual. IVA manual inclusivo 16% para simular el total. No constituye configuración fiscal comercial validada.
- Pro requiere suscripción active, última factura paid y período vigente. La URL de éxito no habilita acceso.
- Eventos firmados se concilian contra el estado actual de Stripe y se deduplican en transacción con bloqueo por cuenta.
- La cancelación al fin del período conserva acceso; deuda o cancelación efectiva retira Pro sin borrar rutinas.

## Pendiente para lanzamiento real

Activación Stripe, dominio/URL final, identidad y domicilio del proveedor, correo de soporte, aviso de privacidad definitivo y mecanismos de exportación/eliminación, facturación/CFDI, validación fiscal, política y proceso de reembolsos/disputas, avisos de renovación y prueba de entrega, claves restringidas cuando corresponda, webhook permanente con sus eventos y firma propios, y pruebas end-to-end de una compra autenticada desde navegador en el despliegue final. Los tests actuales prueban Checkout por servicio y webhook por HTTP; no sustituyen esa última compra desde la UI autenticada.

Se actualizó Next.js y eslint-config-next a 16.3.4, además de parches compatibles de dependencias transitivas. `npm audit --omit=dev` reporta cero vulnerabilidades. Quedan cuatro alertas moderadas en la cadena de herramientas de desarrollo de drizzle-kit/esbuild; su corrección automática propone un downgrade incompatible, por lo que no se aplicó `--force`.
