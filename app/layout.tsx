// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/shop/CartProvider';
import { getSettings } from '@/lib/sheets';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettings();
    return {
      title: {
        default: settings.store_name,
        template: `%s | ${settings.store_name}`,
      },
      description: settings.tagline || 'Handcrafted jewellery for every occasion.',
      icons: { icon: '/favicon.ico' },
    };
  } catch {
    return {
      title: 'Aurelia Jewels',
      description: 'Handcrafted jewellery for every occasion.',
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings;
  try {
    settings = await getSettings();
  } catch {
    settings = {
      store_name: 'Aurelia Jewels',
      store_logo_url: '',
      support_email: 'hello@aureliajewels.com',
      instagram_url: '#',
      tagline: 'Handcrafted with love, worn with grace.',
    };
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <CartProvider>
          <Navbar storeName={settings.store_name} logoUrl={settings.store_logo_url} />
          <main className="min-h-screen">{children}</main>
          <Footer settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}
