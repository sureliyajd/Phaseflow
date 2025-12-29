import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - api/register (registration endpoint)
     * - login (login page)
     * - register (register page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - Static assets (images, icons, favicon)
     * Note: Public folder files are automatically excluded from middleware
     */
    "/((?!api/auth|api/register|login|register|_next/static|_next/image|favicon.ico|phaseflow-logo\\.png|phaseflow-icon\\.png).*)",
  ],
};

