// app/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { getProducts, getSettings } from '@/lib/sheets';
import { ProductCard } from '@/components/shop/ProductCard';
import { Instagram, ArrowRight } from 'lucide-react';

export const revalidate = 60;

const CATEGORIES = [
  { name: 'Necklaces', slug: 'Necklace', emoji: '📿' },
  { name: 'Earrings', slug: 'Earring', emoji: '✨' },
  { name: 'Rings', slug: 'Ring', emoji: '💍' },
  { name: 'Bracelets', slug: 'Bracelet', emoji: '🌟' },
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

  const featured = products.filter((p) => p.featured).slice(0, 8);
  const newArrivals = products.slice(0, 4);

  return (
    <div className="page-enter">
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-cream-100">
        {settings.hero_image_url ? (
          <Image
            src={settings.hero_image_url}
            alt="Hero"
            fill
            priority
            className="object-cover object-center"
          />
        ) : (
          /* Decorative placeholder hero */
          <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-cream-100 to-blush">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 50%, #D4A92A 0%, transparent 60%),
                                  radial-gradient(circle at 70% 20%, #E8C96A 0%, transparent 50%)`,
              }}
            />
            {/* Decorative rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold-200/30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-gold-200/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-gold-200/40" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-charcoal-900/30" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <p className="text-gold-200 text-xs tracking-[0.3em] uppercase font-sans mb-6 animate-fade-in">
              ✦ New Collection 2026
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight text-cream-50 mb-6"
              style={{ animationDelay: '0.1s' }}>
              {settings.hero_heading || 'Jewellery that tells your story'}
            </h1>
            <p className="font-sans text-cream-200/80 text-lg mb-10 leading-relaxed font-light">
              {settings.tagline}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary inline-block">
                Explore Collection
              </Link>
              <Link href="/shop?featured=true" className="border border-cream-50 text-cream-50 px-8 py-3 text-sm tracking-widest uppercase font-sans hover:bg-cream-50 hover:text-charcoal-900 transition-all duration-300 inline-block">
                Featured Pieces
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream-50/60">
          <span className="text-[10px] tracking-widest uppercase font-sans">Scroll</span>
          <div className="w-px h-12 bg-cream-50/30 animate-pulse" />
        </div>
      </section>

      {/* ── USP BAR ──────────────────────────────────── */}
      <section className="bg-charcoal-900 text-cream-100 py-5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: '✦', text: 'Handcrafted' },
            { icon: '🚚', text: 'Free Shipping ₹999+' },
            { icon: '↩', text: '7-Day Returns' },
            { icon: '🔒', text: 'Secure Payments' },
          ].map((item) => (
            <div key={item.text} className="flex items-center justify-center gap-2">
              <span className="text-gold-200 text-sm">{item.icon}</span>
              <span className="text-xs tracking-widest uppercase font-sans text-cream-200/70">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED JEWELLERY ───────────────────────── */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold-400 text-xs tracking-[0.3em] uppercase font-sans mb-3">
              Curated for you
            </p>
            <h2 className="section-title">Featured Collection</h2>
            <div className="gold-divider" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product, idx) => (
              <ProductCard key={product.product_id} product={product} priority={idx < 4} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/shop" className="btn-outline inline-flex items-center gap-3">
              View All Pieces
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* ── SHOP BY CATEGORY ─────────────────────────── */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold-400 text-xs tracking-[0.3em] uppercase font-sans mb-3">
              Browse
            </p>
            <h2 className="section-title">Shop by Category</h2>
            <div className="gold-divider" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const count = products.filter(
                (p) => p.category.toLowerCase() === cat.slug.toLowerCase()
              ).length;
              return (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative aspect-square bg-cream-200 overflow-hidden flex items-end p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/20 transition-colors duration-300" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl opacity-20 group-hover:opacity-30 transition-opacity">
                    {cat.emoji}
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-serif text-2xl font-light text-charcoal-900 group-hover:text-gold-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="font-sans text-xs text-charcoal-800/50 mt-1">
                      {count} {count === 1 ? 'piece' : 'pieces'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ──────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold-400 text-xs tracking-[0.3em] uppercase font-sans mb-3">
              Just landed
            </p>
            <h2 className="section-title">New Arrivals</h2>
            <div className="gold-divider" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── INSTAGRAM / BRAND ─────────────────────────── */}
      <section className="py-20 bg-charcoal-900 text-cream-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Instagram size={28} className="text-gold-200 mx-auto mb-4 opacity-70" />
          <h2 className="font-serif text-4xl font-light text-cream-50 mb-3">
            Follow Our Journey
          </h2>
          <p className="text-cream-200/50 font-sans text-sm mb-8">
            Tag us to be featured · Handcrafted stories every day
          </p>
          {settings.instagram_url && settings.instagram_url !== '#' ? (
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-gold-300/40 text-gold-200 px-8 py-3 text-sm tracking-widest uppercase font-sans hover:bg-gold-300/10 transition-colors"
            >
              <Instagram size={14} />
              Follow on Instagram
            </a>
          ) : null}
        </div>
      </section>

      {/* ── NEWSLETTER TEASER ─────────────────────────── */}
      <section className="py-16 bg-cream-200">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl font-light text-charcoal-900 mb-3">
            Jewellery Stories in Your Inbox
          </h2>
          <p className="font-sans text-sm text-charcoal-800/60 mb-6">
            New arrivals, styling tips, and exclusive offers.
          </p>
          <div className="flex gap-0">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 border border-cream-300 bg-white text-sm font-sans focus:outline-none focus:border-gold-300"
            />
            <button className="bg-charcoal-900 text-cream-50 px-6 py-3 text-xs tracking-widest uppercase font-sans hover:bg-gold-400 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
