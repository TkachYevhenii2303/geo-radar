import { NextRequest, NextResponse } from "next/server";

const REFRESH_TOKEN_KEY = "refreshToken";

const protectedPaths = ["/metrics", "/crawling", "/health"];
const authPaths = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  const isProtected =
    pathname === "/" || protectedPaths.some((p) => pathname.startsWith(p));

  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
