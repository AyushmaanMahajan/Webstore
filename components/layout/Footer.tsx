// components/layout/Footer.tsx
import Link from 'next/link';
import { Instagram, Mail, MessageCircle } from 'lucide-react';
import { BrandMonogram, getStoreWordmark } from '@/components/layout/BrandMonogram';
import type { StoreSettings } from '@/types';

interface FooterProps {
  settings: Partial<StoreSettings>;
}

export function Footer({ settings }: FooterProps) {
  const storeName = settings.store_name || 'Aurelia Jewels';
  const wordmark = getStoreWordmark(storeName);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-900 text-cream-100">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-4">
              <BrandMonogram storeName={storeName} theme="dark" size="lg" />
              <div>
                <h3 className="font-serif text-3xl font-light uppercase tracking-[0.18em] text-gold-200">
                  {wordmark.primary}
                </h3>
                <p className="mt-1 text-[11px] font-sans uppercase tracking-[0.38em] text-cream-200/40">
                  {wordmark.secondary || 'Fine Jewellery'}
                </p>
              </div>
            </div>
            <p className="text-cream-200/60 text-sm leading-relaxed font-sans max-w-xs">
              {settings.tagline || 'Handcrafted with love, worn with grace.'}
            </p>
            <div className="mt-6 w-12 h-px bg-gold-300" />
            <div className="flex gap-4 mt-6">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream-200/50 hover:text-gold-200 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
              )}
              {settings.support_email && (
                <a
                  href={`mailto:${settings.support_email}`}
                  className="text-cream-200/50 hover:text-gold-200 transition-colors"
                  aria-label="Email"
                >
                  <Mail size={18} />
                </a>
              )}
              {settings.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream-200/50 hover:text-gold-200 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-widest uppercase font-sans text-gold-200/80 mb-5">
              Shop
            </h4>
            <ul className="space-y-3">
              {['Necklaces', 'Earrings', 'Rings', 'Bracelets', 'All Jewellery'].map((cat) => (
                <li key={cat}>
                  <Link
                    href={cat === 'All Jewellery' ? '/shop' : `/shop?category=${cat.slice(0, -1)}`}
                    className="text-sm text-cream-200/50 hover:text-cream-100 transition-colors font-sans"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs tracking-widest uppercase font-sans text-gold-200/80 mb-5">
              Help
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/order-tracking" className="text-sm text-cream-200/50 hover:text-cream-100 transition-colors font-sans">
                  Track Order
                </Link>
              </li>
              {settings.support_email && (
                <li>
                  <a
                    href={`mailto:${settings.support_email}`}
                    className="text-sm text-cream-200/50 hover:text-cream-100 transition-colors font-sans"
                  >
                    {settings.support_email}
                  </a>
                </li>
              )}
              <li>
                <span className="text-sm text-cream-200/50 font-sans">
                  Returns within 7 days
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream-200/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-cream-200/30 text-xs font-sans">
            © {year} {storeName}. All rights reserved.
          </p>
          <p className="text-cream-200/20 text-xs font-sans">
            Secure payments via Razorpay
          </p>
        </div>
      </div>
    </footer>
  );
}
