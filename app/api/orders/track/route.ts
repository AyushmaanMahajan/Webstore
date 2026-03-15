// app/api/orders/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/sheets';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('id');
  const email = searchParams.get('email');

  if (!orderId || !email) {
    return NextResponse.json(
      { error: 'Order ID and email are required.' },
      { status: 400 }
    );
  }

  try {
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Verify email matches for privacy
    if (order.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Order details do not match.' },
        { status: 403 }
      );
    }

    // Return only safe fields
    return NextResponse.json({
      order: {
        order_id: order.order_id,
        date: order.date,
        product_name: order.product_name,
        quantity: order.quantity,
        total_price: order.total_price,
        order_status: order.order_status,
        tracking_number: order.tracking_number,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to track order. Please try again.' },
      { status: 500 }
    );
  }
}
