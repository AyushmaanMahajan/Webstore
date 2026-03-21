import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-enter flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-6 font-display text-8xl" style={{ color: 'var(--text-muted)' }}>
        *
      </span>
      <h1 className="mb-3 font-display text-5xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        404
      </h1>
      <p className="mb-6 font-display text-2xl" style={{ color: 'var(--text-secondary)' }}>
        Page not found
      </p>
      <p className="mb-10 max-w-xs text-sm font-body" style={{ color: 'var(--text-secondary)' }}>
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link href="/" className="btn-primary inline-block">
        Return Home
      </Link>
    </div>
  );
}
