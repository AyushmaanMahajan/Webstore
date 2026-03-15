'use client';
// app/order-tracking/page.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, CheckCircle, Truck, MapPin, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const STATUS_STEPS = [
  { key: 'new', label: 'Order Placed', icon: CheckCircle, description: 'We received your order' },
  { key: 'processing', label: 'Processing', icon: Package, description: 'Being packed with care' },
  { key: 'shipped', label: 'Shipped', icon: Truck, description: 'On its way to you' },
  { key: 'delivered', label: 'Delivered', icon: MapPin, description: 'Delivered successfully' },
];

const STATUS_ORDER = ['new', 'processing', 'shipped', 'delivered'];

export default function OrderTrackingPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleTrack(e?: React.FormEvent) {
    e?.preventDefault();
    if (!orderId.trim() || !email.trim()) {
      setError('Please enter both Order ID and email address.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(
        `/api/orders/track?id=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Order not found. Please check your details.');
      } else {
        setOrder(data.order);
      }
    } catch {
      setError('Unable to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-fetch if order ID is in URL (from success page)
  useEffect(() => {
    const urlOrderId = searchParams.get('id');
    if (urlOrderId) setOrderId(urlOrderId);
  }, [searchParams]);

  const currentStatusIndex = order ? STATUS_ORDER.indexOf(order.order_status) : -1;

  return (
    <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="text-center mb-10">
        <p className="text-gold-400 text-xs tracking-[0.3em] uppercase font-sans mb-3">
          Where is my order?
        </p>
        <h1 className="section-title">Track Your Order</h1>
        <div className="gold-divider" />
      </div>

      {/* Search form */}
      <form onSubmit={handleTrack} className="bg-cream-100 p-6 mb-8 space-y-4">
        <div>
          <label className="block text-xs tracking-widest uppercase font-sans text-charcoal-800/60 mb-2">
            Order ID
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="input-field"
            placeholder="e.g. ORD-ABC123-XYZ"
          />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase font-sans text-charcoal-800/60 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="The email used during checkout"
          />
        </div>

        {error && (
          <p className="font-sans text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Search size={14} />
          {loading ? 'Tracking…' : 'Track Order'}
        </button>
      </form>

      {/* Result */}
      {order && (
        <div className="space-y-8">
          {/* Order details */}
          <div className="border border-cream-200 p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-sans text-[10px] tracking-widest uppercase text-charcoal-800/40 mb-1">Order ID</p>
                <p className="font-sans text-sm font-medium text-charcoal-900">{order.order_id}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] tracking-widest uppercase text-charcoal-800/40 mb-1">Date</p>
                <p className="font-sans text-sm text-charcoal-900">{order.date}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] tracking-widest uppercase text-charcoal-800/40 mb-1">Product</p>
                <p className="font-sans text-sm text-charcoal-900">{order.product_name} × {order.quantity}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] tracking-widest uppercase text-charcoal-800/40 mb-1">Total</p>
                <p className="font-sans text-sm font-medium text-charcoal-900">{formatPrice(order.total_price)}</p>
              </div>
            </div>

            {order.tracking_number && (
              <div className="bg-gold-100/30 border border-gold-200/50 px-4 py-3">
                <p className="font-sans text-[10px] tracking-widest uppercase text-gold-400 mb-1">Tracking Number</p>
                <p className="font-sans text-sm font-medium text-charcoal-900">{order.tracking_number}</p>
              </div>
            )}
          </div>

          {/* Status timeline */}
          <div>
            <h2 className="font-serif text-2xl font-light text-charcoal-900 mb-6">Delivery Status</h2>

            <div className="space-y-0">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Icon + line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-gold-300 text-white'
                          : 'bg-cream-200 text-charcoal-800/30'
                      } ${isCurrent ? 'ring-4 ring-gold-200' : ''}`}>
                        <Icon size={18} />
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`w-0.5 h-10 ${isCompleted ? 'bg-gold-300' : 'bg-cream-200'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-8 pt-1.5">
                      <p className={`font-sans text-sm font-medium ${isCompleted ? 'text-charcoal-900' : 'text-charcoal-800/30'}`}>
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] bg-gold-200 text-charcoal-900 px-2 py-0.5 rounded-full tracking-wider uppercase">
                            <Clock size={8} />
                            Current
                          </span>
                        )}
                      </p>
                      <p className={`font-sans text-xs mt-0.5 ${isCompleted ? 'text-charcoal-800/60' : 'text-charcoal-800/20'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
