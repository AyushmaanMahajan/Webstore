// app/api/checkout/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { createOrder, updateInventory } from '@/lib/sheets';
import { generateOrderId, sanitizeString } from '@/lib/utils';
import { rateLimit } from '@/lib/rate-limit';

const VerifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  customer: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }),
  verifiedItems: z.array(
    z.object({
      product_id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
  totalAmount: z.number(),
});

export async function POST(request: NextRequest) {
  const limitResponse = rateLimit(request, 5, 60_000);
  if (limitResponse) return limitResponse;

  try {
    const body = await request.json();
    const parsed = VerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payment data.' }, { status: 400 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      verifiedItems,
      totalAmount,
    } = parsed.data;

    // Verify Razorpay signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment verification failed. Please contact support.' },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Build full address string
    const fullAddress = `${sanitizeString(customer.address)}, ${sanitizeString(customer.city)}, ${sanitizeString(customer.state)} - ${customer.pincode}`;

    // Create orders in Google Sheets (one row per line item)
    for (const item of verifiedItems) {
      await createOrder({
        order_id: orderId,
        customer_name: sanitizeString(customer.name),
        phone: customer.phone,
        email: sanitizeString(customer.email),
        address: fullAddress,
        product_id: item.product_id,
        product_name: sanitizeString(item.name),
        quantity: item.quantity,
        total_price: item.price * item.quantity,
      });

      // Update inventory
      await updateInventory(
        item.product_id,
        -item.quantity,
        `Order #${orderId}`,
        'sale'
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order placed successfully!',
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json(
      {
        error:
          'Payment received but order creation failed. Please contact support with your payment ID.',
      },
      { status: 500 }
    );
  }
}
