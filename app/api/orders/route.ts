// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getOrderById } from '@/lib/sheets';

export async function GET(request: NextRequest) {
  // Simple secret-based auth for admin
  const secret = request.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (orderId) {
      const order = await getOrderById(orderId);
      if (!order) {
        return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    const orders = await getOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }
}
