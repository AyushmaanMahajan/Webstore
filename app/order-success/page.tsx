'use client';
// app/order-success/page.tsx
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="page-enter min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-8">
          <CheckCircle size={40} className="text-green-500" />
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-light text-charcoal-900 mb-3">
          Thank you!
        </h1>
        <p className="font-serif text-xl font-light text-gold-400 mb-6 italic">
          Your jewellery is on its way
        </p>

        {orderId && (
          <div className="bg-cream-100 border border-cream-200 px-6 py-4 mb-8 inline-block">
            <p className="font-sans text-xs tracking-widest uppercase text-charcoal-800/50 mb-1">
              Order ID
            </p>
            <p className="font-sans text-sm font-medium text-charcoal-900">{orderId}</p>
          </div>
        )}

        <p className="font-sans text-sm text-charcoal-800/60 leading-relaxed mb-10 max-w-sm mx-auto">
          You'll receive a confirmation email shortly. Your order will be shipped within 2–3 business days.
        </p>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: '✓', label: 'Order Confirmed', active: true },
            { icon: '📦', label: 'Being Packed', active: false },
            { icon: '🚚', label: 'On the Way', active: false },
          ].map((step) => (
            <div key={step.label} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                step.active ? 'bg-gold-300 text-white' : 'bg-cream-200 text-charcoal-800/30'
              }`}>
                {step.icon}
              </div>
              <span className="font-sans text-[10px] tracking-wider uppercase text-charcoal-800/50">
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
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2 justify-center">
            Continue Shopping
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
