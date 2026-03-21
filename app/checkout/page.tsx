'use client';
// app/checkout/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/shop/CartProvider';
import { formatPrice, isValidEmail, isValidPhone, isValidPincode } from '@/lib/utils';
import { CheckoutFormData } from '@/types';
import { Lock, Truck, AlertCircle, CreditCard, Banknote } from 'lucide-react';
import Image from 'next/image';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

type PaymentMethod = 'online' | 'cod';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [form, setForm] = useState<CheckoutFormData>({
    name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<CheckoutFormData>>({});

  const shipping = totalPrice >= 999 ? 0 : 99;
  const grandTotal = totalPrice + shipping;

  function updateField(key: keyof CheckoutFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
  }

  function validate(): boolean {
    const errors: Partial<CheckoutFormData> = {};
    if (!form.name.trim() || form.name.length < 2) errors.name = 'Please enter your full name.';
    if (!isValidPhone(form.phone)) errors.phone = 'Enter a valid 10-digit mobile number.';
    if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.';
    if (!form.address.trim() || form.address.length < 10) errors.address = 'Enter your complete address.';
    if (!form.city.trim()) errors.city = 'Enter your city.';
    if (!form.state) errors.state = 'Select your state.';
    if (!isValidPincode(form.pincode)) errors.pincode = 'Enter a valid 6-digit pincode.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function loadRazorpay(): Promise<boolean> {
    if (window.Razorpay) return true;
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // ── COD flow ────────────────────────────────────────────────────────────────
  async function handleCOD() {
    setError('');
    if (!validate()) return;
    if (cart.length === 0) { setError('Your bag is empty.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customer: form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not place order. Please try again.');
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/order-success?orderId=${data.orderId}`);
    } catch (err) {
      console.error('COD error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  // ── Online payment flow ──────────────────────────────────────────────────────
  async function handleOnlinePayment() {
    setError('');
    if (!validate()) return;
    if (cart.length === 0) { setError('Your bag is empty.'); return; }

    setLoading(true);
    try {
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customer: form }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        setError(checkoutData.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        setError('Payment gateway failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: checkoutData.keyId,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        order_id: checkoutData.orderId,
        name: 'Aurelia Jewels',
        description: 'Handcrafted Jewellery',
        prefill: {
          name: checkoutData.customer.name,
          email: checkoutData.customer.email,
          contact: checkoutData.customer.phone,
        },
        theme: { color: '#9B6FD4' },
        modal: {
          ondismiss: () => { setLoading(false); },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch('/api/checkout/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customer: form,
              verifiedItems: checkoutData.verifiedItems,
              totalAmount: checkoutData.totalAmount,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            clearCart();
            router.push(`/order-success?orderId=${verifyData.orderId}`);
          } else {
            setError(
              verifyData.error ||
                'Payment received but order creation failed. Please contact support.'
            );
            setLoading(false);
          }
        },
      });

      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Something went wrong. Please try again or contact support.');
      setLoading(false);
    }
  }

  function handleSubmit() {
    if (paymentMethod === 'cod') {
      handleCOD();
    } else {
      handleOnlinePayment();
    }
  }

  if (cart.length === 0) {
    return (
      <div className="page-enter min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="font-display text-2xl font-light mb-6" style={{ color: 'var(--text-primary)' }}>
          Your bag is empty
        </p>
        <a href="/shop" className="btn-primary">Go Shopping</a>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="section-title">Checkout</h1>
        <div className="gold-divider mx-0 mt-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

        {/* ── LEFT: Form ── */}
        <div className="lg:col-span-3 space-y-8">

          {/* Contact */}
          <div>
            <h2 className="font-display text-2xl font-light mb-5" style={{ color: 'var(--text-primary)' }}>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-widest uppercase font-body mb-2" style={{ color: 'var(--text-muted)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="input-field"
                  placeholder="Riya Sharma"
                />
                {fieldErrors.name && (
                  <p className="text-xs font-body mt-1" style={{ color: '#F87171' }}>{fieldErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase font-body mb-2" style={{ color: 'var(--text-muted)' }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="input-field"
                  placeholder="9876543210"
                  maxLength={10}
                />
                {fieldErrors.phone && (
                  <p className="text-xs font-body mt-1" style={{ color: '#F87171' }}>{fieldErrors.phone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs tracking-widest uppercase font-body mb-2" style={{ color: 'var(--text-muted)' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="input-field"
                  placeholder="riya@email.com"
                />
                {fieldErrors.email && (
                  <p className="text-xs font-body mt-1" style={{ color: '#F87171' }}>{fieldErrors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div>
            <h2 className="font-display text-2xl font-light mb-5" style={{ color: 'var(--text-primary)' }}>
              Delivery Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs tracking-widest uppercase font-body mb-2" style={{ color: 'var(--text-muted)' }}>
                  Street Address *
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="input-field resize-none h-20"
                  placeholder="Flat / House No., Street, Area"
                />
                {fieldErrors.address && (
                  <p className="text-xs font-body mt-1" style={{ color: '#F87171' }}>{fieldErrors.address}</p>
                )}
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase font-body mb-2" style={{ color: 'var(--text-muted)' }}>
                  City *
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="input-field"
                  placeholder="Mumbai"
                />
                {fieldErrors.city && (
                  <p className="text-xs font-body mt-1" style={{ color: '#F87171' }}>{fieldErrors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase font-body mb-2" style={{ color: 'var(--text-muted)' }}>
                  State *
                </label>
                <select
                  value={form.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select State</option>
                  {INDIA_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {fieldErrors.state && (
                  <p className="text-xs font-body mt-1" style={{ color: '#F87171' }}>{fieldErrors.state}</p>
                )}
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase font-body mb-2" style={{ color: 'var(--text-muted)' }}>
                  Pincode *
                </label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => updateField('pincode', e.target.value)}
                  className="input-field"
                  placeholder="400001"
                  maxLength={6}
                />
                {fieldErrors.pincode && (
                  <p className="text-xs font-body mt-1" style={{ color: '#F87171' }}>{fieldErrors.pincode}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Payment method selector ── */}
          <div>
            <h2 className="font-display text-2xl font-light mb-5" style={{ color: 'var(--text-primary)' }}>
              Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Online payment card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className="text-left p-5 rounded-xl border transition-all duration-200"
                style={{
                  background: paymentMethod === 'online'
                    ? 'rgba(155, 111, 212, 0.12)'
                    : 'var(--glass)',
                  borderColor: paymentMethod === 'online'
                    ? 'var(--violet-bright)'
                    : 'var(--glass-border)',
                  boxShadow: paymentMethod === 'online'
                    ? '0 0 0 1px var(--violet), 0 4px 20px var(--violet-glow)'
                    : 'none',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(155, 111, 212, 0.15)' }}
                  >
                    <CreditCard size={18} style={{ color: 'var(--violet-bright)' }} />
                  </div>
                  <span className="font-body font-600 text-sm" style={{ color: 'var(--text-primary)' }}>
                    Pay Online
                  </span>
                  {paymentMethod === 'online' && (
                    <span
                      className="ml-auto text-[10px] font-600 font-body px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--violet)', color: '#fff' }}
                    >
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs font-body leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  UPI, cards, netbanking & wallets via Razorpay
                </p>
              </button>

              {/* COD card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className="text-left p-5 rounded-xl border transition-all duration-200"
                style={{
                  background: paymentMethod === 'cod'
                    ? 'rgba(196, 127, 168, 0.10)'
                    : 'var(--glass)',
                  borderColor: paymentMethod === 'cod'
                    ? 'var(--rose)'
                    : 'var(--glass-border)',
                  boxShadow: paymentMethod === 'cod'
                    ? '0 0 0 1px var(--rose), 0 4px 20px var(--rose-glow)'
                    : 'none',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(196, 127, 168, 0.15)' }}
                  >
                    <Banknote size={18} style={{ color: 'var(--rose-gold)' }} />
                  </div>
                  <span className="font-body font-600 text-sm" style={{ color: 'var(--text-primary)' }}>
                    Cash on Delivery
                  </span>
                  {paymentMethod === 'cod' && (
                    <span
                      className="ml-auto text-[10px] font-600 font-body px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--rose)', color: '#fff' }}
                    >
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs font-body leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Pay in cash when your order arrives
                </p>
              </button>
            </div>

            {/* COD notice */}
            {paymentMethod === 'cod' && (
              <div
                className="mt-4 flex items-start gap-3 p-4 rounded-xl"
                style={{
                  background: 'rgba(196, 127, 168, 0.08)',
                  border: '1px solid rgba(196, 127, 168, 0.20)',
                }}
              >
                <Truck size={16} style={{ color: 'var(--rose-gold)', flexShrink: 0, marginTop: 1 }} />
                <p className="text-xs font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Cash on Delivery is available across India. Please keep the exact amount ready at the time of delivery. Orders are typically delivered within 5–7 business days.
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                background: 'rgba(248, 113, 113, 0.08)',
                border: '1px solid rgba(248, 113, 113, 0.25)',
              }}
            >
              <AlertCircle size={16} style={{ color: '#F87171', flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm font-body" style={{ color: '#FCA5A5' }}>{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-3 py-4 disabled:opacity-60 disabled:cursor-not-allowed"
            style={paymentMethod === 'cod' ? {
              background: 'linear-gradient(135deg, #9B4F80, #C47FA8)',
              boxShadow: '0 4px 24px var(--rose-glow)',
            } : {}}
          >
            {paymentMethod === 'cod' ? (
              <>
                <Truck size={16} />
                {loading ? 'Placing Order…' : `Place Order — ${formatPrice(grandTotal)} COD`}
              </>
            ) : (
              <>
                <Lock size={16} />
                {loading ? 'Processing…' : `Pay ${formatPrice(grandTotal)} Securely`}
              </>
            )}
          </button>

          <p className="text-xs font-body text-center" style={{ color: 'var(--text-muted)' }}>
            {paymentMethod === 'cod'
              ? 'No payment required now · Pay cash on delivery'
              : 'Secured by Razorpay · 256-bit SSL encryption'}
          </p>
        </div>

        {/* ── RIGHT: Order summary ── */}
        <div className="lg:col-span-2">
          <div
            className="glass-card p-6 sticky top-24"
          >
            <h2 className="font-display text-xl font-light mb-5" style={{ color: 'var(--text-primary)' }}>
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.product_id} className="flex gap-3">
                  <div
                    className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg"
                    style={{ background: 'var(--navy-light)' }}
                  >
                    {item.image_url_1 && (
                      <Image
                        src={item.image_url_1}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    )}
                    <span
                      className="absolute -top-1 -right-1 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-body font-600"
                      style={{ background: 'var(--violet)', color: '#fff' }}
                    >
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-body leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {item.name}
                    </p>
                    <p className="text-xs font-body mt-1" style={{ color: 'var(--text-muted)' }}>
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs font-body font-600 shrink-0" style={{ color: 'var(--text-primary)' }}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="pt-4 space-y-2"
              style={{ borderTop: '1px solid var(--glass-border)' }}
            >
              <div className="flex justify-between text-sm font-body">
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span style={{ color: 'var(--text-primary)' }}>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span style={{ color: 'var(--text-secondary)' }}>Payment</span>
                <span style={{ color: paymentMethod === 'cod' ? 'var(--rose-gold)' : 'var(--violet-bright)' }}>
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
                </span>
              </div>
              <div
                className="pt-3 flex justify-between font-body font-600"
                style={{ borderTop: '1px solid var(--glass-border)' }}
              >
                <span style={{ color: 'var(--text-primary)' }}>Total</span>
                <span style={{ color: 'var(--text-primary)' }}>{formatPrice(grandTotal)}</span>
              </div>
              {paymentMethod === 'cod' && (
                <p className="text-[11px] font-body pt-1" style={{ color: 'var(--text-muted)' }}>
                  Amount due at delivery: {formatPrice(grandTotal)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}