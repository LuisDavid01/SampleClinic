import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
//route matcher solo para las rutas de paciente
const isPacienteRoute = createRouteMatcher(["/pacientes(.*)"]);

//estas rutas estan protegidas
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/user(.*)",
  "/pacientes(.*)",
]);

// Función para verificar si es una ruta de admin
const isAdminRoute = (req: Request) => req.url.includes('/admin');
export default clerkMiddleware(async (auth, req) => {

  if (isProtectedRoute(req)) await auth.protect();
  const authData = await auth();
  const isAdmin = isAdminRoute(req);
  if (isAdmin) {
    
    const userRole = authData.sessionClaims?.metadata?.role;
    // Solo administradores pueden acceder a rutas de admin
    if (userRole !== "admin") {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }

  // Para rutas de pacientes: usar la misma lógica que checkRole
  //const isPacienteRoute = req.url.includes('/pacientes');
  if (isPacienteRoute(req)) {
    const userRole = authData.sessionClaims?.metadata?.role;

    // Si el usuario no tiene rol específico, se considera paciente por defecto
    // Solo bloquear si tiene un rol explícito diferente a "paciente" y "admin"
    if (userRole && userRole !== "paciente" && userRole !== "admin") {
      const url = new URL("/dashboard", req.url);
      return NextResponse.redirect(url);
    }
  }
});


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}