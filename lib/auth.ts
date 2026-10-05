import { createSecretKey } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

export const authSecret = process.env.AUTH_SECRET || 'development-secret';
export const secretKey = createSecretKey(Buffer.from(authSecret));

export async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}
