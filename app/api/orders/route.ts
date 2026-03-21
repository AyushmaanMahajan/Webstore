// app/api/orders/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/sheets';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('id');
  const email   = searchParams.get('email');

  if (!orderId || !email) {
    return NextResponse.json(
      { error: 'Order ID and email are required.' },
      { status: 400 }
    );
  }

  try {
    const order = await getOrderById(orderId.trim());

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. Please check your Order ID.' },
        { status: 404 }
      );
    }

    if (order.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return NextResponse.json(
        { error: 'Order details do not match. Please check your email.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      order: {
        order_id:        order.order_id,
        date:            order.date,
        product_name:    order.product_name,
        quantity:        order.quantity,
        total_price:     order.total_price,
        order_status:    order.order_status,
        tracking_number: order.tracking_number,
        payment_status:  order.payment_status,
        notes:           order.notes,
      },
    });
  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json(
      { error: 'Unable to fetch order. Please try again.' },
      { status: 500 }
    );
  }
}