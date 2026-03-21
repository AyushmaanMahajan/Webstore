// app/api/checkout/cod/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProductById } from '@/lib/sheets';
import { createOrder, updateInventory } from '@/lib/sheets';
import { generateOrderId, sanitizeString, isValidPhone, isValidPincode } from '@/lib/utils';
import { rateLimit } from '@/lib/rate-limit';

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

const CODSchema = z.object({
  cart: z.array(CartItemSchema).min(1).max(20),
  customer: CustomerSchema,
});

export async function POST(request: NextRequest) {
  // Rate limit: 5 COD orders per minute per IP
  const limitResponse = rateLimit(request, 5, 60_000);
  if (limitResponse) return limitResponse;

  try {
    const body = await request.json();

    const parsed = CODSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid order data.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { cart, customer } = parsed.data;

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

    // Validate stock server-side for every item
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
          { error: `Only ${product.inventory_count} unit(s) of "${product.name}" available.` },
          { status: 400 }
        );
      }
    }

    // Generate order ID
    const orderId = generateOrderId();
    const fullAddress = `${sanitizeString(customer.address)}, ${sanitizeString(customer.city)}, ${sanitizeString(customer.state)} - ${customer.pincode}`;

    // Write each line item to ORDERS sheet with payment_status = pending (COD)
    for (const item of cart) {
      const product = await getProductById(item.product_id);
      const effectivePrice = product?.discount_price ?? product?.price ?? item.price;

      await createOrder({
        order_id: orderId,
        customer_name: sanitizeString(customer.name),
        phone: customer.phone,
        email: sanitizeString(customer.email),
        address: fullAddress,
        product_id: item.product_id,
        product_name: sanitizeString(item.name),
        quantity: item.quantity,
        total_price: effectivePrice * item.quantity,
        payment_status: 'pending',
        });

      // Deduct inventory immediately on COD too
      await updateInventory(
        item.product_id,
        -item.quantity,
        `COD Order #${orderId}`,
        'sale'
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'COD order placed successfully!',
    });

  } catch (error) {
    console.error('COD order error:', error);
    return NextResponse.json(
      { error: 'Unable to place order. Please try again.' },
      { status: 500 }
    );
  }
}