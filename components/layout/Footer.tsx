import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Mail, MessageCircle } from 'lucide-react';
import type { StoreSettings } from '@/types';

interface FooterProps {
  settings: Partial<StoreSettings>;
}

export function Footer({ settings }: FooterProps) {
  const storeName = settings.store_name || 'Aurelia Jewels';
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--navy)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/logo.svg"
              alt={storeName}
              width={56}
              height={56}
              className="mb-4 h-14 w-14 object-contain"
            />
            <div className="accent-line mb-4" />
            <p
              className="max-w-xs text-sm font-body leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {settings.tagline || 'Handcrafted with love, worn with grace.'}
            </p>
            <div className="mt-6 flex gap-4">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:-translate-y-1 hover:scale-110"
                  style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
                  aria-label="Instagram"
                >
                  <Instagram size={16} style={{ color: 'var(--text-secondary)' }} />
                </a>
              )}
              {settings.support_email && (
                <a
                  href={`mailto:${settings.support_email}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:-translate-y-1 hover:scale-110"
                  style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
                  aria-label="Email"
                >
                  <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                </a>
              )}
              {settings.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:-translate-y-1 hover:scale-110"
                  style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={16} style={{ color: 'var(--text-secondary)' }} />
                </a>
              )}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4
              className="mb-5 text-xs font-body font-semibold tracking-widest uppercase"
              style={{ color: 'var(--violet-bright)' }}
            >
              Shop
            </h4>
            <ul className="space-y-3">
              {['Necklaces', 'Earrings', 'Rings', 'Bracelets', 'All Jewellery'].map((cat) => (
                <li key={cat}>
                  <Link
                    href={cat === 'All Jewellery' ? '/shop' : `/shop?category=${cat.slice(0, -1)}`}
                    className="text-sm font-body transition-colors duration-200 hover:text-white"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h4
              className="mb-5 text-xs font-body font-semibold tracking-widest uppercase"
              style={{ color: 'var(--violet-bright)' }}
            >
              Help
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/order-tracking"
                  className="text-sm font-body transition-colors hover:text-white"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Track Order
                </Link>
              </li>
              {settings.support_email && (
                <li>
                  <a
                    href={`mailto:${settings.support_email}`}
                    className="text-sm font-body transition-colors hover:text-white"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {settings.support_email}
                  </a>
                </li>
              )}
              <li>
                <span className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>
                  7-day returns
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
            © {year} {storeName}. All rights reserved.
          </p>
          <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
            Secure payments via Razorpay
          </p>
        </div>
      </div>
    </footer>
  );
}