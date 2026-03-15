// lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server';

const rateMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  request: NextRequest,
  maxRequests = 10,
  windowMs = 60_000
): NextResponse | null {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'anonymous';

  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  const existing = rateMap.get(key);

  if (!existing || now > existing.resetTime) {
    rateMap.set(key, { count: 1, resetTime: now + windowMs });
    return null;
  }

  if (existing.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  existing.count++;
  return null;
}
