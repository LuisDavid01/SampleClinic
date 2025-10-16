import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from "next/server";
import { EmployeeRoles } from './types/roles';

/*
 * Las rutas separadas por RouteMatcher deben tener logica de proteccion.
 *
 *
 *
 */
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isPacienteRoute = createRouteMatcher(["/pacientes(.*)"]);


//estas rutas estan protegidas independiente del rol.
const isProtectedRoute = createRouteMatcher([
	"/dashboard(.*)",
	"/user(.*)",

]);
export default clerkMiddleware(async (auth, req) => {
	const authData = await auth();
	const userRole = authData.sessionClaims?.metadata?.role as string | undefined;

	if (isProtectedRoute(req)) {
		if (!authData.userId) {
			const url = new URL("/", req.url);
			return NextResponse.redirect(url);
		}
	};
	const isAdmin = isAdminRoute(req);
	if (isAdmin) {

		// Solo administradores pueden acceder a rutas de admin
		if (!userRole || !EmployeeRoles.includes(userRole as any)) {
			const url = new URL("/", req.url);
			return NextResponse.redirect(url);
		}
	}

	// Para rutas de pacientes: usar la misma lógica que checkRole
	//const isPacienteRoute = req.url.includes('/pacientes');
	if (isPacienteRoute(req)) {

		// Si el usuario no tiene rol específico, se considera paciente por defecto
		// Solo bloquear si tiene un rol explícito diferente a "paciente" y "admin"
		if (!userRole) {
			const url = new URL("/", req.url);
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
