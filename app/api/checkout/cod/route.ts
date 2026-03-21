// app/api/checkout/cod/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProductById, createOrder, updateInventory } from '@/lib/sheets';
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

    // ── Step 1: Fetch all products in parallel (single pass) ─────────────────
    // This is the fix — previously getProductById was called twice per item,
    // causing a race condition where the second call could see stale inventory.
    const productResults = await Promise.all(
      cart.map((item) => getProductById(item.product_id))
    );

    // ── Step 2: Validate stock using the already-fetched products ────────────
    const resolvedItems: Array<{
      product_id: string;
      name: string;
      effectivePrice: number;
      quantity: number;
    }> = [];

    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const product = productResults[i];

      if (!product) {
        return NextResponse.json(
          { error: `"${item.name}" is no longer available.` },
          { status: 400 }
        );
      }

      if (product.status !== 'active') {
        return NextResponse.json(
          { error: `"${product.name}" is currently unavailable.` },
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

      // Use server-side price — never trust client
      resolvedItems.push({
        product_id: product.product_id,
        name: product.name,
        effectivePrice: product.discount_price ?? product.price,
        quantity: item.quantity,
      });
    }

    // ── Step 3: Generate order ID and build address ──────────────────────────
    const orderId = generateOrderId();
    const fullAddress = [
      sanitizeString(customer.address),
      sanitizeString(customer.city),
      sanitizeString(customer.state),
      customer.pincode,
    ].join(', ');

    // ── Step 4: Write orders and update inventory sequentially ───────────────
    // Must be sequential (not parallel) so Sheets row appends don't collide
    for (const item of resolvedItems) {
      await createOrder({
        order_id: orderId,
        customer_name: sanitizeString(customer.name),
        phone: customer.phone,
        email: sanitizeString(customer.email),
        address: fullAddress,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        total_price: item.effectivePrice * item.quantity,
        payment_status: 'pending',
        notes: 'Cash on Delivery',
      });

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