'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/components/shop/CartProvider';
import { cn } from '@/lib/utils';

interface NavbarProps {
  storeName: string;
  logoUrl?: string;
}

const NAV_LINKS = [
  { href: '/shop', label: 'Shop All' },
  { href: '/shop?category=Necklace', label: 'Necklaces' },
  { href: '/shop?category=Earring', label: 'Earrings' },
  { href: '/shop?category=Ring', label: 'Rings' },
  { href: '/shop?category=Bracelet', label: 'Bracelets' },
];

export function Navbar({ storeName, logoUrl }: NavbarProps) {
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <div
        style={{
          background: 'linear-gradient(90deg, #4A2878, #C47FA8, #4A2878)',
          backgroundSize: '200% 100%',
        }}
        className="py-2 text-center text-xs font-body font-medium tracking-widest text-white"
      >
        Free shipping on orders above INR 999+ | Handcrafted with love
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'border-b border-white/[0.08] bg-midnight/80 shadow-lg backdrop-blur-xl'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between md:h-20">

            <button
              className="p-2 text-white/70 transition-colors hover:text-white md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <nav className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.slice(0, 2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-body font-medium tracking-widest uppercase text-white/60 transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/"
              aria-label={storeName || 'Home'}
              className="absolute left-1/2 -translate-x-1/2"
            >
              <Image
                src="/logo.svg"
                alt={storeName}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
                priority
              />
            </Link>

            <div className="flex items-center gap-8">
              <nav className="hidden items-center gap-8 md:flex">
                {NAV_LINKS.slice(2).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs font-body tracking-widest uppercase text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <Link
                href="/cart"
                className="relative p-2 text-white/70 transition-colors hover:text-white"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #9B6FD4, #C47FA8)' }}
                    />
                    <span className="relative z-10">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/[0.08] bg-midnight/95 px-6 py-6 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-body tracking-widest uppercase text-white/70 transition-colors hover:text-white"
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