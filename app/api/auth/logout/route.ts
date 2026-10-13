import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const acceptsHtml = request.headers.get('accept')?.includes('text/html');

  const response = acceptsHtml
    ? NextResponse.redirect(new URL('/login', request.url), 303)
    : NextResponse.json({ success: true });

  response.cookies.set('auth_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
