'use client';
// components/shop/AddToCartSection.tsx
import { useState } from 'react';
import { ShoppingBag, Minus, Plus, Check } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from './CartProvider';

interface AddToCartSectionProps {
  product: Product;
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const isOutOfStock = product.inventory_count <= 0;
  const maxQty = Math.min(product.inventory_count, 10);
  const effectivePrice = product.discount_price ?? product.price;

  function handleAdd() {
    if (isOutOfStock) return;
    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: effectivePrice,
      image_url_1: product.image_url_1,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  if (isOutOfStock) {
    return (
      <div className="space-y-4">
        <div className="w-full py-4 text-center border border-cream-200 bg-cream-100 text-sm font-sans text-charcoal-800/50 tracking-widest uppercase">
          Out of Stock
        </div>
        <p className="font-sans text-xs text-charcoal-800/40 text-center">
          We're restocking soon. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="font-sans text-xs tracking-widest uppercase text-charcoal-800/50">
          Qty
        </span>
        <div className="flex items-center border border-cream-200">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-charcoal-800/60 hover:text-charcoal-900 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center font-sans text-sm text-charcoal-900">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            className="w-10 h-10 flex items-center justify-center text-charcoal-800/60 hover:text-charcoal-900 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Add to bag */}
      <button
        onClick={handleAdd}
        className={`w-full py-4 flex items-center justify-center gap-3 text-sm tracking-widest uppercase font-sans transition-all duration-300 ${
          added
            ? 'bg-green-600 text-white'
            : 'bg-charcoal-900 text-cream-50 hover:bg-gold-400 hover:text-charcoal-900'
        }`}
      >
        {added ? (
          <>
            <Check size={16} />
            Added to Bag
          </>
        ) : (
          <>
            <ShoppingBag size={16} />
            Add to Bag
          </>
        )}
      </button>

      {/* Buy now */}
      <a
        href="/checkout"
        onClick={(e) => {
          e.preventDefault();
          handleAdd();
          setTimeout(() => (window.location.href = '/checkout'), 300);
        }}
        className="w-full py-4 flex items-center justify-center text-sm tracking-widest uppercase font-sans border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-cream-50 transition-all duration-300"
      >
        Buy Now
      </a>
    </div>
  );
}
