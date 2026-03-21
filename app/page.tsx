import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Instagram,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { NewsletterSection } from '@/components/shop/NewsletterSection';
import { getProducts, getSettings } from '@/lib/sheets';

export const revalidate = 60;

const CATEGORIES = [
  { name: 'Necklaces', slug: 'Necklace', mark: 'N' },
  { name: 'Earrings',  slug: 'Earring',  mark: 'E' },
  { name: 'Rings',     slug: 'Ring',     mark: 'R' },
  { name: 'Bracelets', slug: 'Bracelet', mark: 'B' },
];

export default async function HomePage() {
  const [products, settings] = await Promise.all([
    getProducts().catch(() => []),
    getSettings().catch(() => ({
      store_name: 'Aurelia Jewels',
      tagline: 'Handcrafted with love, worn with grace.',
      hero_heading: 'Jewellery that tells your story',
      hero_image_url: '',
      instagram_url: '#',
      store_logo_url: '',
      support_email: '',
    })),
  ]);

  const featured    = products.filter((p) => p.featured).slice(0, 8);
  const newArrivals = products.slice(0, 4);

  return (
    <div className="page-enter">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[95vh] items-center overflow-hidden">
        {settings.hero_image_url && (
          <Image src={settings.hero_image_url} alt="Hero" fill priority
            className="object-cover object-center opacity-30" />
        )}

        {/* Ambient orbs */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(155,111,212,0.28) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(196,127,168,0.20) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ border: '1px solid rgba(155,111,212,0.14)' }} />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ border: '1px solid rgba(196,127,168,0.10)' }} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-body font-medium tracking-widest uppercase"
              style={{ background: 'rgba(155,111,212,0.15)', border: '1px solid rgba(155,111,212,0.3)', color: '#D4C8E8' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9B6FD4', display: 'inline-block' }} />
              New Collection 2026
            </div>

            <h1 className="mb-6 font-display font-semibold leading-tight"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', color: 'var(--text-primary)' }}>
              {settings.hero_heading || 'Jewellery that tells your story'}
            </h1>

            <p className="mb-10 text-lg font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {settings.tagline || 'Handcrafted with love, worn with grace.'}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary">Explore Collection</Link>
              <Link href="/shop?featured=true" className="btn-outline">Featured Pieces</Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
          style={{ color: 'var(--text-muted)' }}>
          <span className="text-[10px] font-body tracking-widest uppercase">Scroll</span>
          <div className="h-10 w-px animate-pulse"
            style={{ background: 'linear-gradient(to bottom, rgba(155,111,212,0.6), transparent)' }} />
        </div>
      </section>

      {/* ── USP BAR ──────────────────────────────────────────────────────── */}
      <section className="py-5"
        style={{ background: 'rgba(155,111,212,0.07)', borderTop: '1px solid rgba(155,111,212,0.15)', borderBottom: '1px solid rgba(155,111,212,0.15)' }}>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 text-center md:grid-cols-4">
          {[
            { icon: Sparkles,    text: 'Handcrafted' },
            { icon: Truck,       text: 'Free Shipping INR 999+' },
            { icon: RotateCcw,   text: '7-Day Returns' },
            { icon: ShieldCheck, text: 'Secure Payments' },
          ].map((item) => (
            <div key={item.text} className="flex items-center justify-center gap-2">
              <item.icon size={14} style={{ color: 'var(--violet-bright)' }} />
              <span className="text-xs font-body font-medium tracking-widest uppercase"
                style={{ color: 'var(--text-secondary)' }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED COLLECTION ──────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-body tracking-[0.3em] uppercase" style={{ color: 'var(--violet-bright)' }}>
              Curated for you
            </p>
            <h2 className="section-title">Featured Collection</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {featured.map((product, idx) => (
              <ProductCard key={product.product_id} product={product} priority={idx < 4} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/shop" className="btn-outline inline-flex items-center gap-2">
              View All Pieces <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* ── SHOP BY CATEGORY ─────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-body tracking-[0.3em] uppercase" style={{ color: 'var(--violet-bright)' }}>
              Browse
            </p>
            <h2 className="section-title">Shop by Category</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const count = products.filter(
                (p) => p.category.toLowerCase() === cat.slug.toLowerCase()
              ).length;
              return (
                <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
                  className="glass-card-hover group relative flex aspect-square items-end overflow-hidden p-6">
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: 'linear-gradient(135deg, rgba(155,111,212,0.22), rgba(196,127,168,0.14))' }} />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-6xl opacity-10 transition-opacity group-hover:opacity-20"
                    style={{ color: 'var(--text-primary)' }}>
                    {cat.mark}
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-display text-2xl font-normal transition-colors group-hover:text-violet-bright"
                      style={{ color: 'var(--text-primary)' }}>
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                      {count} {count === 1 ? 'piece' : 'pieces'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-body tracking-[0.3em] uppercase" style={{ color: 'var(--violet-bright)' }}>
              Just landed
            </p>
            <h2 className="section-title">New Arrivals</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── INSTAGRAM ────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'var(--navy)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="glass-card mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Instagram size={24} style={{ color: 'var(--violet-bright)' }} />
          </div>
          <h2 className="mb-3 font-display text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Follow Our Journey
          </h2>
          <p className="mb-8 text-sm font-body" style={{ color: 'var(--text-secondary)' }}>
            Tag us to be featured and discover handcrafted stories every day.
          </p>
          {settings.instagram_url && settings.instagram_url !== '#' && (
            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex items-center gap-2">
              <Instagram size={14} /> Follow on Instagram
            </a>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER — wired to Google Sheets SUBSCRIBERS tab ──────────── */}
      <NewsletterSection />

    </div>
  );
}