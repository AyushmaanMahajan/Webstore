// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addSubscriber } from '@/lib/sheets';
import { rateLimit } from '@/lib/rate-limit';

const SubscribeSchema = z.object({
  email: z.string().email().max(200),
});

export async function POST(request: NextRequest) {
  const limitResponse = rateLimit(request, 3, 60_000);
  if (limitResponse) return limitResponse;

  try {
    const body = await request.json();
    const parsed = SubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    await addSubscriber(parsed.data.email);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Duplicate subscriber — treat as success so we don't leak info
    if (error?.message === 'ALREADY_SUBSCRIBED') {
      return NextResponse.json({ success: true });
    }
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Could not subscribe. Please try again.' },
      { status: 500 }
    );
  }
}