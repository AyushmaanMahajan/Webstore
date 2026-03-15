'use client';
// components/shop/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, getDiscountPercent, cn } from '@/lib/utils';
import { useCart } from './CartProvider';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const isOutOfStock = product.inventory_count <= 0;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPct = hasDiscount
    ? getDiscountPercent(product.price, product.discount_price!)
    : 0;

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
      <div className="product-card relative overflow-hidden bg-cream-100">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-cream-200">
          {product.image_url_1 ? (
            <Image
              src={product.image_url_1}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cream-200">
              <span className="font-serif text-4xl text-cream-300">✦</span>
            </div>
          )}

          {/* Badges */}
          {isOutOfStock ? (
            <span className="badge-out-of-stock">Out of Stock</span>
          ) : hasDiscount ? (
            <span className="badge-sale">{discountPct}% off</span>
          ) : null}

          {/* Quick add — appears on hover */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-0 left-0 right-0 bg-charcoal-900 text-cream-50 py-3 text-xs tracking-widest uppercase font-sans translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} />
              Add to Bag
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[10px] tracking-widest uppercase font-sans text-gold-400 mb-1">
            {product.category}
          </p>
          <h3 className="font-serif text-lg font-light text-charcoal-900 leading-snug mb-2 group-hover:text-gold-400 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm font-medium text-charcoal-900">
              {formatPrice(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="font-sans text-xs text-charcoal-800/40 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader
export function ProductCardSkeleton() {
  return (
    <div className="bg-cream-100">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}
