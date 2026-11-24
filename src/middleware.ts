import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/products",
  "/orders",
  "/inventory",
  "/earnings",
  "/store",
  "/settings",
  "/categories",
  "/customers",
  "/offers",
  "/staff",
  "/verification-status",
  "/onboarding",
];

const AUTH_PAGES = ["/login", "/register", "/verify", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("suvora_seller_token")?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isAuthPage = AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );

  // 1. Unauthenticated user trying to access protected dashboard routes
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user trying to access login/register pages
  if (isAuthPage && token) {
    // If user has a valid session token, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo images
     * - api routes (handled individually)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

