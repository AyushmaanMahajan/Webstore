'use client';
// components/shop/ShopFilters.tsx
import { useRouter, useSearchParams } from 'next/navigation';

interface ShopFiltersProps {
  categories: string[];
  activeCategory: string;
}

export function ShopFilters({ categories, activeCategory }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    params.delete('featured');
    router.push(`/shop?${params.toString()}`);
  }

  const allCategories = ['All', ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => {
        const isActive = activeCategory === cat || (cat === 'All' && activeCategory === 'All');
        return (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`px-5 py-2 text-xs tracking-widest uppercase font-sans transition-all duration-200 ${
              isActive
                ? 'bg-charcoal-900 text-cream-50'
                : 'border border-cream-200 text-charcoal-800/60 hover:border-charcoal-900 hover:text-charcoal-900'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
