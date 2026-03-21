import type { Metadata } from 'next';
import { ProductCard } from '@/components/shop/ProductCard';
import { ShopFilters } from '@/components/shop/ShopFilters';
import { getCategories, getProducts } from '@/lib/sheets';

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
      (product) => product.category.toLowerCase() === searchParams.category!.toLowerCase()
    );
  }

  if (searchParams.featured === 'true') {
    products = products.filter((product) => product.featured);
  }

  const activeCategory = searchParams.category || 'All';

  return (
    <div className="page-enter">
      <div
        className="py-14 text-center"
        style={{ background: 'var(--navy)', borderBottom: '1px solid var(--glass-border)' }}
      >
        <p className="mb-3 text-xs font-body tracking-[0.3em] uppercase" style={{ color: 'var(--violet-bright)' }}>
          Our Collection
        </p>
        <h1 className="section-title">
          {searchParams.featured === 'true'
            ? 'Featured Pieces'
            : searchParams.category
              ? `${searchParams.category}s`
              : 'All Jewellery'}
        </h1>
        <div className="gold-divider" />
        <p className="mt-4 text-sm font-body" style={{ color: 'var(--text-muted)' }}>
          {products.length} {products.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ShopFilters categories={categories} activeCategory={activeCategory} />

        {products.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product, idx) => (
              <ProductCard key={product.product_id} product={product} priority={idx < 8} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <span className="font-display text-5xl" style={{ color: 'var(--silver-dim)' }}>
              *
            </span>
            <p className="mt-4 font-display text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
              No pieces found
            </p>
            <p className="mt-2 text-sm font-body" style={{ color: 'var(--text-muted)' }}>
              Try a different category or check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
