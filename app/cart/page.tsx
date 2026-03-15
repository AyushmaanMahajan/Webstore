'use client';
// app/cart/page.tsx
import { useCart } from '@/components/shop/CartProvider';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="page-enter min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag size={48} className="text-cream-300 mb-6" />
        <h1 className="font-serif text-4xl font-light text-charcoal-900 mb-3">
          Your bag is empty
        </h1>
        <p className="font-sans text-sm text-charcoal-800/50 mb-8 max-w-xs">
          Looks like you haven't added anything yet. Explore our collection.
        </p>
        <Link href="/shop" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const shipping = totalPrice >= 999 ? 0 : 99;
  const grandTotal = totalPrice + shipping;

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="section-title">Your Bag</h1>
        <div className="gold-divider mx-0 mt-3" />
        <p className="font-sans text-sm text-charcoal-800/50 mt-3">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.product_id} className="flex gap-4 pb-6 border-b border-cream-200">
              {/* Image */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 bg-cream-100 overflow-hidden">
                {item.image_url_1 ? (
                  <Image
                    src={item.image_url_1}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-2xl text-cream-300">✦</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <Link
                    href={`/product/${item.product_id}`}
                    className="font-serif text-xl font-light text-charcoal-900 hover:text-gold-400 transition-colors leading-snug"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="text-charcoal-800/30 hover:text-charcoal-900 transition-colors shrink-0"
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="font-sans text-sm text-charcoal-800/60 mt-1">
                  {formatPrice(item.price)} each
                </p>

                <div className="flex items-center justify-between mt-4">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-cream-200">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-charcoal-800/60 hover:text-charcoal-900"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center font-sans text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-charcoal-800/60 hover:text-charcoal-900"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <span className="font-sans text-sm font-medium text-charcoal-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-cream-100 p-6 sticky top-24">
            <h2 className="font-serif text-2xl font-light text-charcoal-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm font-sans">
                <span className="text-charcoal-800/60">Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm font-sans">
                <span className="text-charcoal-800/60">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs font-sans text-gold-400">
                  Add {formatPrice(999 - totalPrice)} more for free shipping
                </p>
              )}
              <div className="w-full h-px bg-cream-200" />
              <div className="flex justify-between font-sans font-medium">
                <span>Total</span>
                <span className="text-charcoal-900">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full btn-primary flex items-center justify-center gap-3"
            >
              Proceed to Checkout
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/shop"
              className="mt-4 w-full text-center text-xs tracking-widest uppercase font-sans text-charcoal-800/40 hover:text-charcoal-900 transition-colors block py-3"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
