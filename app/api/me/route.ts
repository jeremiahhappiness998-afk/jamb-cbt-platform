import { NextRequest, NextResponse } from 'next/server';

const protectedPaths = ['/dashboard', '/practice', '/simulation', '/results', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = Boolean(request.cookies.get('auth_token')?.value);

  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isProtected && !hasAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/practice/:path*', '/simulation/:path*', '/results/:path*', '/admin/:path*'],
};
