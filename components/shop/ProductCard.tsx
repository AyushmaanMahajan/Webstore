'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Sparkles } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { useCart } from './CartProvider';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const isOutOfStock = product.inventory_count <= 0;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPct = hasDiscount ? getDiscountPercent(product.price, product.discount_price!) : 0;
  const effectivePrice = product.discount_price ?? product.price;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: effectivePrice,
      image_url_1: product.image_url_1,
      quantity: 1,
    });
  }

  return (
    <Link href={`/product/${product.product_id}`} className="block group">
      <div className="product-card">
        <div className="relative aspect-[3/4] overflow-hidden" style={{ background: 'var(--navy-light)' }}>
          {product.image_url_1 ? (
            <Image
              src={product.image_url_1}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Sparkles size={40} style={{ color: 'var(--text-muted)' }} />
            </div>
          )}

          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: 'linear-gradient(to top, rgba(8,11,24,0.7) 0%, transparent 60%)' }}
          />

          {isOutOfStock ? (
            <span className="badge-out-of-stock">Out of Stock</span>
          ) : hasDiscount ? (
            <span className="badge-sale">{discountPct}% off</span>
          ) : null}

          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-0 left-0 right-0 flex translate-y-full items-center justify-center gap-2 py-3 text-xs font-body font-semibold tracking-widest uppercase text-white transition-transform duration-300 group-hover:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #9333EA)' }}
            >
              <ShoppingBag size={13} />
              Add to Bag
            </button>
          )}
        </div>

        <div className="p-4">
          <span className="category-pill">{product.category}</span>
          <h3
            className="mb-2 font-display text-lg font-normal leading-snug transition-colors group-hover:text-violet-bright"
            style={{ color: 'var(--text-primary)' }}
          >
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-body font-semibold" style={{ color: 'var(--text-primary)' }}>
              {formatPrice(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs font-body line-through" style={{ color: 'var(--text-muted)' }}>
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="aspect-[3/4] skeleton" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-1/3 rounded-lg" />
      </div>
    </div>
  );
}
