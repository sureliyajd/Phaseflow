import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow root path to pass through (handled by page component)
    if (req.nextUrl.pathname === "/") {
      return NextResponse.next();
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow root path without authentication
        if (req.nextUrl.pathname === "/") {
          return true;
        }
        return !!token;
      },
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
     * Note: The root path "/" is handled by the page component itself
     * Public folder files are automatically excluded from middleware
     */
    "/((?!api/auth|api/register|login|register|_next/static|_next/image|favicon.ico|phaseflow-logo\\.png|phaseflow-icon\\.png).*)",
  ],
};

