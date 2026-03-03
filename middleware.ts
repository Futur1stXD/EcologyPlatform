import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;

  const isLoggedIn = !!session;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/profile") ||
    nextUrl.pathname.startsWith("/chat") ||
    nextUrl.pathname.startsWith("/rewards") ||
    nextUrl.pathname.startsWith("/products/new") ||
    nextUrl.pathname.startsWith("/subscription");

  if (isAdminRoute) {
    if (!isLoggedIn || session?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
