// app/shop/page.tsx
import type { Metadata } from 'next';
import { getProducts, getCategories } from '@/lib/sheets';
import { ProductCard } from '@/components/shop/ProductCard';
import { ShopFilters } from '@/components/shop/ShopFilters';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our handcrafted jewellery collection.',
};

interface ShopPageProps {
  searchParams: { category?: string; featured?: string };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [allProducts, categories] = await Promise.all([
    getProducts().catch(() => []),
    getCategories().catch(() => []),
  ]);

  let products = allProducts;

  if (searchParams.category) {
    products = products.filter(
      (p) => p.category.toLowerCase() === searchParams.category!.toLowerCase()
    );
  }

  if (searchParams.featured === 'true') {
    products = products.filter((p) => p.featured);
  }

  const activeCategory = searchParams.category || 'All';

  return (
    <div className="page-enter">
      {/* Page header */}
      <div className="bg-cream-100 border-b border-cream-200 py-14 text-center">
        <p className="text-gold-400 text-xs tracking-[0.3em] uppercase font-sans mb-3">
          Our Collection
        </p>
        <h1 className="section-title">
          {searchParams.featured === 'true'
            ? 'Featured Pieces'
            : searchParams.category
            ? searchParams.category + 's'
            : 'All Jewellery'}
        </h1>
        <div className="gold-divider" />
        <p className="font-sans text-sm text-charcoal-800/50 mt-4">
          {products.length} {products.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category filters */}
        <ShopFilters categories={categories} activeCategory={activeCategory} />

        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
            {products.map((product, idx) => (
              <ProductCard key={product.product_id} product={product} priority={idx < 8} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <span className="font-serif text-5xl text-cream-300">✦</span>
            <p className="font-serif text-2xl text-charcoal-900 mt-4 font-light">
              No pieces found
            </p>
            <p className="font-sans text-sm text-charcoal-800/50 mt-2">
              Try a different category or check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
