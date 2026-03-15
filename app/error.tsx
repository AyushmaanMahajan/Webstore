'use client';
// app/error.tsx
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <span className="font-serif text-6xl text-cream-300 mb-6">✦</span>
      <h1 className="font-serif text-4xl font-light text-charcoal-900 mb-3">
        Something went wrong
      </h1>
      <p className="font-sans text-sm text-charcoal-800/50 mb-10 max-w-sm">
        We're sorry for the inconvenience. Please try again or contact support.
      </p>
      <div className="flex gap-4">
        <button onClick={reset} className="btn-primary">
          Try Again
        </button>
        <Link href="/" className="btn-outline">
          Go Home
        </Link>
      </div>
    </div>
  );
}
