'use client';
// app/order-success/page.tsx
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="page-enter min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">

        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)' }}
        >
          <CheckCircle size={40} style={{ color: '#4ADE80' }} />
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-light mb-3" style={{ color: 'var(--text-primary)' }}>
          Thank you!
        </h1>
        <p className="font-display text-xl font-light italic mb-6" style={{ color: 'var(--violet-bright)' }}>
          Your jewellery is on its way
        </p>

        {orderId && (
          <div
            className="glass-card px-6 py-4 mb-8 inline-block"
          >
            <p className="font-body text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Order ID
            </p>
            <p className="font-body text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {orderId}
            </p>
          </div>
        )}

        <p className="font-body text-sm leading-relaxed mb-10 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
          You'll receive a confirmation email shortly. Your order will be shipped within 2–3 business days.
        </p>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Order Confirmed', active: true },
            { label: 'Being Packed',    active: false },
            { label: 'On the Way',      active: false },
          ].map((step, idx) => (
            <div key={step.label} className="flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-body font-medium"
                style={{
                  background: step.active
                    ? 'linear-gradient(135deg, #7A4FB8, #9B6FD4)'
                    : 'rgba(155,111,212,0.08)',
                  color: step.active ? '#fff' : 'var(--text-muted)',
                  border: step.active ? 'none' : '1px solid var(--glass-border)',
                }}
              >
                {idx + 1}
              </div>
              <span
                className="font-body text-[10px] tracking-wider uppercase text-center"
                style={{ color: step.active ? 'var(--text-secondary)' : 'var(--text-muted)' }}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {orderId && (
            <Link
              href={`/order-tracking?id=${orderId}`}
              className="btn-outline inline-flex items-center gap-2 justify-center"
            >
              <Package size={14} />
              Track Order
            </Link>
          )}
          <Link
            href="/shop"
            className="btn-primary inline-flex items-center gap-2 justify-center"
          >
            Continue Shopping
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--violet)', borderTopColor: 'transparent' }}
        />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}