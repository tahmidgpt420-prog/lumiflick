import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
  verifySessionToken,
  verifyUsername,
  verifyPassword,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/** Check whether the caller currently holds a valid admin session. */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  return NextResponse.json({ authenticated: Boolean(session) });
}

/** Log in: verify credentials, issue a signed httpOnly session cookie. */
export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: 'Username and password are required' },
      { status: 400 }
    );
  }

  // Always run both checks (no early return) so failure timing doesn't reveal
  // which field was wrong.
  const validUsername = verifyUsername(username);
  const validPassword = verifyPassword(password);

  if (!validUsername || !validPassword) {
    return NextResponse.json(
      { success: false, error: 'Invalid username or password.' },
      { status: 401 }
    );
  }

  const token = createSessionToken(username);
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  return response;
}

/** Log out: clear the session cookie. */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
