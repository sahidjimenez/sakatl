import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/ejercicios(.*)",
  "/api/exercises(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Modo invitado: rutinas guardadas solo en localStorage, sin cuenta.
  "/invitado(.*)",
  // Vista pública de solo lectura de rutinas de la comunidad.
  "/comunidad(.*)",
  "/api/community(.*)",
  // Asistente de IA para invitados (sin cuenta) y transcripción de audio,
  // usada tanto por el chat de invitado como por el de usuarios logueados.
  "/api/assistant-invitado(.*)",
  "/api/transcribe(.*)",
  // Autenticado con CRON_SECRET (header Authorization), no con sesión de Clerk.
  "/api/cron(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
