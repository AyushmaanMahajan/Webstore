// app/product/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/sheets';
import { ProductGallery } from '@/components/shop/ProductGallery';
import { AddToCartSection } from '@/components/shop/AddToCartSection';
import { ProductCard } from '@/components/shop/ProductCard';
import { formatPrice, getDiscountPercent } from '@/lib/utils';

export const revalidate = 60;

interface ProductPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductById(params.id).catch(() => null);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: product.image_url_1 ? [{ url: product.image_url_1 }] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((p) => ({ id: p.product_id }));
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id).catch(() => null);
  if (!product || product.status !== 'active') notFound();

  const allProducts = await getProducts().catch(() => []);
  const related = allProducts
    .filter((p) => p.category === product.category && p.product_id !== product.product_id)
    .slice(0, 4);

  const isOutOfStock = product.inventory_count <= 0;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const effectivePrice = product.discount_price ?? product.price;
  const discountPct = hasDiscount ? getDiscountPercent(product.price, product.discount_price!) : 0;

  const images = [product.image_url_1, product.image_url_2, product.image_url_3].filter(Boolean);

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
        {/* Gallery */}
        <ProductGallery images={images} name={product.name} />

        {/* Product info */}
        <div className="flex flex-col justify-center">
          <p className="text-gold-400 text-xs tracking-[0.3em] uppercase font-sans mb-3">
            {product.category}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-charcoal-900 leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-sans text-2xl font-medium text-charcoal-900">
              {formatPrice(effectivePrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="font-sans text-base text-charcoal-800/40 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="font-sans text-sm text-gold-400 font-medium">
                  Save {discountPct}%
                </span>
              </>
            )}
          </div>

          <p className="font-sans text-xs text-charcoal-800/50 mb-6">
            Inclusive of all taxes
          </p>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-400' : 'bg-green-500'}`} />
            <span className="font-sans text-xs text-charcoal-800/60">
              {isOutOfStock
                ? 'Out of stock'
                : product.inventory_count <= 3
                ? `Only ${product.inventory_count} left`
                : 'In stock'}
            </span>
          </div>

          <div className="w-full h-px bg-cream-200 mb-6" />

          {/* Description */}
          <p className="font-sans text-sm text-charcoal-800/70 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Add to cart */}
          <AddToCartSection product={product} />

          <div className="w-full h-px bg-cream-200 my-8" />

          {/* Details */}
          <div className="space-y-3">
            {[
              ['Material', 'Premium quality, handcrafted'],
              ['Care', 'Avoid contact with water and perfumes'],
              ['Delivery', 'Ships in 3–5 business days'],
              ['Returns', '7-day hassle-free returns'],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-4 text-sm">
                <span className="font-sans text-xs tracking-widest uppercase text-charcoal-800/40 w-20 shrink-0 pt-0.5">
                  {label}
                </span>
                <span className="font-sans text-charcoal-800/70">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-24">
          <div className="text-center mb-12">
            <h2 className="section-title">You may also like</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
