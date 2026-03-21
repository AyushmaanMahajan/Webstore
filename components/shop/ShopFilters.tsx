'use client';

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
            className="px-5 py-2 text-xs tracking-widest uppercase font-body transition-all duration-200"
            style={
              isActive
                ? {
                    background: 'linear-gradient(135deg, #7A4FB8, #9B6FD4)',
                    color: '#F0EAF8',
                    border: '1px solid transparent',
                    borderRadius: 8,
                  }
                : {
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 8,
                  }
            }
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
