// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <span className="font-serif text-8xl text-cream-300 mb-6">✦</span>
      <h1 className="font-serif text-5xl font-light text-charcoal-900 mb-3">404</h1>
      <p className="font-serif text-2xl font-light text-charcoal-900/60 mb-6">
        Page not found
      </p>
      <p className="font-sans text-sm text-charcoal-800/50 mb-10 max-w-xs">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link href="/" className="btn-primary inline-block">
        Return Home
      </Link>
    </div>
  );
}
