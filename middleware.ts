export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public uploads
     * - api/auth (NextAuth endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads/|api/auth).*)",
  ],
};
