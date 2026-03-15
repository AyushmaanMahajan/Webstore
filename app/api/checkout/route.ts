// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProductById } from '@/lib/sheets';
import { getRazorpayInstance } from '@/lib/razorpay';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeString, isValidEmail, isValidPhone, isValidPincode } from '@/lib/utils';

const CartItemSchema = z.object({
  product_id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive().max(10),
  image_url_1: z.string(),
});

const CustomerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  email: z.string().email().max(200),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().length(6),
});

const CheckoutSchema = z.object({
  cart: z.array(CartItemSchema).min(1).max(20),
  customer: CustomerSchema,
});

export async function POST(request: NextRequest) {
  // Rate limiting: max 5 checkout attempts per minute per IP
  const limitResponse = rateLimit(request, 5, 60_000);
  if (limitResponse) return limitResponse;

  try {
    const body = await request.json();

    // Validate schema
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid checkout data.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { cart, customer } = parsed.data;

    // Additional custom validation
    if (!isValidPhone(customer.phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    if (!isValidPincode(customer.pincode)) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit pincode.' },
        { status: 400 }
      );
    }

    // Verify stock for each item in cart (server-side)
    let totalAmount = 0;
    const verifiedItems = [];

    for (const item of cart) {
      const product = await getProductById(item.product_id);

      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.name}" is no longer available.` },
          { status: 400 }
        );
      }

      if (product.status !== 'active') {
        return NextResponse.json(
          { error: `Product "${product.name}" is currently unavailable.` },
          { status: 400 }
        );
      }

      if (product.inventory_count < item.quantity) {
        if (product.inventory_count === 0) {
          return NextResponse.json(
            { error: `"${product.name}" is out of stock.` },
            { status: 400 }
          );
        }
        return NextResponse.json(
          {
            error: `Only ${product.inventory_count} unit(s) of "${product.name}" available.`,
          },
          { status: 400 }
        );
      }

      // Use server-side price, not client-provided
      const effectivePrice = product.discount_price ?? product.price;
      totalAmount += effectivePrice * item.quantity;

      verifiedItems.push({
        product_id: product.product_id,
        name: product.name,
        price: effectivePrice,
        quantity: item.quantity,
      });
    }

    // Create Razorpay order (amount in paise)
    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        customer_name: sanitizeString(customer.name),
        customer_email: sanitizeString(customer.email),
      },
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      customer: {
        name: sanitizeString(customer.name),
        email: sanitizeString(customer.email),
        phone: customer.phone,
      },
      verifiedItems,
      totalAmount,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Unable to process checkout. Please try again.' },
      { status: 500 }
    );
  }
}
