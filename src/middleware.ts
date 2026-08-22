import { NextRequest, NextResponse } from 'next/server';

/**
 * Gate every admin page and admin API route behind a valid session cookie.
 *
 * This runs on the Edge runtime, which does not have Node's `crypto` module —
 * only Web Crypto (`crypto.subtle`). So verification here is a self-contained
 * Edge-safe re-implementation of the HMAC check in `src/lib/adminAuth.ts`
 * (which is used by the Node-runtime route handlers instead). Keep the two
 * in sync if the token format changes.
 */

const ADMIN_SESSION_COOKIE = 'lf_admin_session';

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = '';
  const view = new Uint8Array(bytes);
  for (let i = 0; i < view.length; i++) binary += String.fromCharCode(view[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): string {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return atob(b64);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifySession(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  const expected = toBase64Url(sigBuf);
  if (!constantTimeEqual(expected, signature)) return false;

  try {
    const payload = JSON.parse(fromBase64Url(payloadB64));
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/jw8yenjnkanhr823/login';
  const isSessionApi = pathname === '/api/admin/session';

  // The public storefront reads these unauthenticated (testimonials, the
  // homepage hero slider, raw photo gallery) — only GET is exempt, writes
  // to the same paths still require a session. Store settings used to be
  // here too, but the storefront now reads /api/store-settings instead
  // (outside this matcher, so no allowlist entry needed) — this route is
  // admin-dashboard-only now, so header_scripts etc. are no longer
  // world-readable.
  const publicGetPaths = new Set([
    '/api/admin/reviews',
    '/api/admin/banners',
  ]);
  const isPublicRead = request.method === 'GET' && publicGetPaths.has(pathname);

  if (isLoginPage || isSessionApi || isPublicRead) {
    // Still forward the pathname header so the root layout can detect
    // admin routes and skip injecting tracking scripts.
    const res = NextResponse.next();
    res.headers.set('x-pathname', pathname);
    return res;
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = secret ? await verifySession(token, secret) : false;

  if (!valid) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/jw8yenjnkanhr823/login', request.url);
    if (token) loginUrl.searchParams.set('expired', '1');
    return NextResponse.redirect(loginUrl);
  }

  const res = NextResponse.next();
  // Forward the pathname so the root Server Component layout can
  // check isAdminRoute without re-parsing the URL.
  res.headers.set('x-pathname', pathname);
  return res;
}

export const config = {
  matcher: ['/jw8yenjnkanhr823/:path*', '/api/admin/:path*'],
};
