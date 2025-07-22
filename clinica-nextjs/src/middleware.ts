import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
//estas rutas solo pueden ser accedidas por administradores
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

//estas rutas estan protegidas 
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/forum(.*)'])
export default clerkMiddleware(async (auth, req) => {

  if (isProtectedRoute(req)) await auth.protect()
  const isAdmin = isAdminRoute(req);
  if (isAdmin) {
    const authData = await auth();

    const userRole = authData.sessionClaims?.metadata?.role;

    if (userRole !== "admin") {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }
  
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
