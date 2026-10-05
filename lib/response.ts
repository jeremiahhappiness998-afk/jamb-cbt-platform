import { NextResponse } from 'next/server';

export async function handleProtectedRequest() {
  return NextResponse.json({ ok: true, message: 'Protected endpoint reached' });
}
