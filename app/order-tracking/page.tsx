'use client';
// app/order-tracking/page.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, CheckCircle, Truck, MapPin, Clock, CreditCard, Banknote } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const STATUS_STEPS = [
  { key: 'new',        label: 'Order Placed',  icon: CheckCircle, description: 'We received your order' },
  { key: 'processing', label: 'Processing',    icon: Package,     description: 'Being packed with care' },
  { key: 'shipped',    label: 'Shipped',       icon: Truck,       description: 'On its way to you' },
  { key: 'delivered',  label: 'Delivered',     icon: MapPin,      description: 'Delivered successfully' },
];

const STATUS_ORDER = ['new', 'processing', 'shipped', 'delivered'];

export default function OrderTrackingPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const urlId = searchParams.get('id');
    if (urlId) setOrderId(urlId);
  }, [searchParams]);

  async function handleTrack(e?: React.FormEvent) {
    e?.preventDefault();
    if (!orderId.trim() || !email.trim()) {
      setError('Please enter both your Order ID and email address.');
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
        setError(data.error || 'Order not found. Please double-check your details.');
      } else {
        setOrder(data.order);
      }
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const currentStatusIndex = order ? STATUS_ORDER.indexOf(order.order_status) : -1;
  const isPaid = order?.payment_status === 'paid';
  const isCOD = order?.notes?.toLowerCase().includes('cash on delivery');


  return (
    <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] uppercase font-body mb-3" style={{ color: 'var(--violet-bright)' }}>
          Where is my order?
        </p>
        <h1 className="section-title">Track Your Order</h1>
        <div className="gold-divider" />
        <p className="font-body text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
          Enter your Order ID and the email you used at checkout.
        </p>
      </div>

      <form onSubmit={handleTrack} className="glass-card p-6 mb-8 space-y-4">
        <div>
          <label className="block text-xs tracking-widest uppercase font-body mb-2" style={{ color: 'var(--text-muted)' }}>
            Order ID
          </label>
          <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)}
            className="input-field" placeholder="e.g. ORD-ABC123-XYZ" autoComplete="off" />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase font-body mb-2" style={{ color: 'var(--text-muted)' }}>
            Email Address
          </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="input-field" placeholder="Email used during checkout" />
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg text-sm font-body"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#FCA5A5' }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          <Search size={14} />
          {loading ? 'Searching…' : 'Track Order'}
        </button>
      </form>

      {order && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-light mb-5" style={{ color: 'var(--text-primary)' }}>
              Order Details
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
              {[
                { label: 'Order ID',    value: order.order_id },
                { label: 'Date',        value: order.date },
                { label: 'Product',     value: `${order.product_name} × ${order.quantity}` },
                { label: 'Order Total', value: formatPrice(order.total_price) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] tracking-widest uppercase font-body mb-1" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </p>
                  <p className="font-body text-sm" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Payment status */}
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl mb-4"
              style={{
                background: isPaid ? 'rgba(74,222,128,0.08)' : 'rgba(251,191,36,0.08)',
                border: isPaid ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(251,191,36,0.25)',
              }}>
              {isCOD
                ? <Banknote size={15} style={{ color: isPaid ? '#4ADE80' : '#FCD34D', flexShrink: 0, marginTop: 1 }} />
                : <CreditCard size={15} style={{ color: isPaid ? '#4ADE80' : '#FCD34D', flexShrink: 0, marginTop: 1 }} />
              }
              <div>
                <p className="font-body text-xs font-medium" style={{ color: isPaid ? '#4ADE80' : '#FCD34D' }}>
                  {isPaid ? 'Payment Confirmed' : isCOD ? 'Cash on Delivery — Pay at door' : 'Payment Pending'}
                </p>
                {isCOD && !isPaid && (
                  <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Please keep {formatPrice(order.total_price)} ready when your order arrives.
                  </p>
                )}
              </div>
            </div>

            {/* Tracking number */}
            {order.tracking_number && (
              <div className="px-4 py-3 rounded-xl"
                style={{ background: 'rgba(155,111,212,0.10)', border: '1px solid rgba(155,111,212,0.25)' }}>
                <p className="text-[10px] tracking-widest uppercase font-body mb-1" style={{ color: 'var(--violet-bright)' }}>
                  Courier Tracking Number
                </p>
                <p className="font-body text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {order.tracking_number}
                </p>
                <p className="font-body text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Use this on your courier's website to track the shipment directly.
                </p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-light mb-6" style={{ color: 'var(--text-primary)' }}>
              Delivery Status
            </h2>
            <div>
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                const isLast = idx === STATUS_STEPS.length - 1;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                        style={{
                          background: isCompleted ? 'linear-gradient(135deg, #7A4FB8, #9B6FD4)' : 'rgba(155,111,212,0.08)',
                          border: isCurrent ? '2px solid var(--violet-bright)' : isCompleted ? '2px solid transparent' : '1px solid var(--glass-border)',
                          boxShadow: isCurrent ? '0 0 16px var(--violet-glow)' : 'none',
                          color: isCompleted ? '#fff' : 'var(--text-muted)',
                        }}>
                        <Icon size={17} />
                      </div>
                      {!isLast && (
                        <div className="w-0.5 my-1" style={{
                          minHeight: 32,
                          background: isCompleted
                            ? 'linear-gradient(to bottom, var(--violet), rgba(155,111,212,0.3))'
                            : 'var(--glass-border)',
                        }} />
                      )}
                    </div>
                    <div className="pb-7 pt-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-body text-sm font-medium"
                          style={{ color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-body font-medium px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(155,111,212,0.20)', color: 'var(--violet-bright)', border: '1px solid rgba(155,111,212,0.30)' }}>
                            <Clock size={8} /> Current
                          </span>
                        )}
                      </div>
                      <p className="font-body text-xs mt-0.5"
                        style={{ color: isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="font-body text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Status and tracking number are updated by the store owner in Google Sheets.
          </p>
        </div>
      )}
    </div>
  );
}