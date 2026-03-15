'use client';
// components/layout/Navbar.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/components/shop/CartProvider';
import { BrandMonogram, getStoreWordmark } from '@/components/layout/BrandMonogram';
import { cn } from '@/lib/utils';

interface NavbarProps {
  storeName: string;
}

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=Necklace', label: 'Necklaces' },
  { href: '/shop?category=Earrings', label: 'Earrings' },
  { href: '/shop?category=Rings', label: 'Rings' },
  { href: '/shop?category=Bracelet', label: 'Bracelets' },
];

export function Navbar({ storeName }: NavbarProps) {
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wordmark = getStoreWordmark(storeName);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-charcoal-900 text-cream-100 text-center py-2 text-xs tracking-widest uppercase font-sans">
        Free shipping on orders above ₹999 · Handcrafted with love
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-cream-50/95 backdrop-blur-md shadow-sm border-b border-cream-200'
            : 'bg-cream-50 border-b border-cream-200'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-charcoal-900"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Nav links - desktop */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs tracking-widest uppercase font-sans text-charcoal-800 hover:text-gold-400 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Logo / Brand */}
            <Link
              href="/"
              aria-label={storeName}
              className="absolute left-1/2 -translate-x-1/2 flex items-center"
            >
              <div className="flex items-center gap-2 lg:gap-3">
                <BrandMonogram storeName={storeName} size="md" />
                <div className="hidden lg:flex flex-col leading-none">
                  <span className="font-serif text-xl font-light tracking-[0.18em] uppercase text-charcoal-900">
                    {wordmark.primary}
                  </span>
                  <span className="mt-1 text-[9px] font-sans uppercase tracking-[0.42em] text-charcoal-800/65">
                    {wordmark.secondary || 'Fine Jewellery'}
                  </span>
                </div>
              </div>
            </Link>

            {/* Right nav */}
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-8">
                {NAV_LINKS.slice(3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs tracking-widest uppercase font-sans text-charcoal-800 hover:text-gold-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Cart icon */}
              <Link
                href="/cart"
                className="relative p-2 text-charcoal-900 hover:text-gold-400 transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold-300 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans font-medium">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-cream-50 border-t border-cream-200 px-6 py-6">
            <nav className="flex flex-col gap-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm tracking-widest uppercase font-sans text-charcoal-800"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
