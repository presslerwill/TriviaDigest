import { NextRequest, NextResponse } from 'next/server';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5;

const ipStore = new Map<string, { count: number; windowStart: number }>();

export function middleware(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    ipStore.set(ip, { count: 1, windowStart: now });
    return NextResponse.next();
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterSecs = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSecs) },
      },
    );
  }

  entry.count += 1;
  return NextResponse.next();
}

export const config = {
  matcher: '/api/submit',
};
