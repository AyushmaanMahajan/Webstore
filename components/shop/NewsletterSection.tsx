'use client';
// components/shop/NewsletterSection.tsx
import { useState } from 'react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage("You're in! We'll send you our latest arrivals and offers.");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect. Please try again.');
    }
  }

  return (
    <section
      className="py-16"
      style={{
        background: 'rgba(155,111,212,0.06)',
        borderTop: '1px solid rgba(155,111,212,0.14)',
      }}
    >
      <div className="mx-auto max-w-xl px-6 text-center">
        <div className="glass-card px-6 py-10 sm:px-8">
          <h2
            className="mb-3 font-display text-3xl font-normal"
            style={{ color: 'var(--text-primary)' }}
          >
            Jewellery Stories in Your Inbox
          </h2>
          <p className="mb-6 text-sm font-body" style={{ color: 'var(--text-secondary)' }}>
            New arrivals, styling tips, and exclusive offers.
          </p>

          {status === 'success' ? (
            <div
              className="px-5 py-4 rounded-xl font-body text-sm"
              style={{
                background: 'rgba(74,222,128,0.08)',
                border: '1px solid rgba(74,222,128,0.25)',
                color: '#4ADE80',
              }}
            >
              ✦ {message}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="input-field flex-1"
                disabled={status === 'loading'}
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-3 text-xs font-body" style={{ color: '#FCA5A5' }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}