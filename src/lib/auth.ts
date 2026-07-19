import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-fallback-key-replace-in-prod';
const key = new TextEncoder().encode(SECRET_KEY);

export const SESSION_COOKIE = 'quiz_student_session';
export const ADMIN_COOKIE = 'quiz_admin_session';

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function setStudentSession(studentId: string) {
  const token = await signToken({ studentId });
  cookies().set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getStudentSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function clearStudentSession() {
  cookies().delete(SESSION_COOKIE);
}

export async function setAdminSession() {
  const token = await signToken({ admin: true });
  cookies().set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getAdminSession() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function clearAdminSession() {
  cookies().delete(ADMIN_COOKIE);
}
