'use client';
// app/checkout/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/shop/CartProvider';
import { formatPrice, isValidEmail, isValidPhone, isValidPincode } from '@/lib/utils';
import { CheckoutFormData } from '@/types';
import { Lock, AlertCircle } from 'lucide-react';
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

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  async function handleCheckout() {
    setError('');
    if (!validate()) return;
    if (cart.length === 0) { setError('Your bag is empty.'); return; }

    setLoading(true);
    try {
      // Step 1: Create Razorpay order + validate stock
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

      // Step 2: Load Razorpay SDK
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        setError('Payment gateway failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Step 3: Open Razorpay modal
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
        theme: { color: '#D4A92A' },
        modal: {
          ondismiss: () => { setLoading(false); },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // Step 4: Verify payment and create order
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

  if (cart.length === 0) {
    return (
      <div className="page-enter min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="font-serif text-2xl font-light text-charcoal-900 mb-6">
          Your bag is empty
        </p>
        <a href="/shop" className="btn-primary inline-block">Go Shopping</a>
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
        {/* Form */}
        <div className="lg:col-span-3 space-y-8">
          {/* Contact */}
          <div>
            <h2 className="font-serif text-2xl font-light text-charcoal-900 mb-5">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-widest uppercase font-sans text-charcoal-800/60 mb-2">
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
                  <p className="text-red-500 text-xs font-sans mt-1">{fieldErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase font-sans text-charcoal-800/60 mb-2">
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
                  <p className="text-red-500 text-xs font-sans mt-1">{fieldErrors.phone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs tracking-widest uppercase font-sans text-charcoal-800/60 mb-2">
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
                  <p className="text-red-500 text-xs font-sans mt-1">{fieldErrors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div>
            <h2 className="font-serif text-2xl font-light text-charcoal-900 mb-5">
              Delivery Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs tracking-widest uppercase font-sans text-charcoal-800/60 mb-2">
                  Street Address *
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="input-field resize-none h-20"
                  placeholder="Flat / House No., Street, Area"
                />
                {fieldErrors.address && (
                  <p className="text-red-500 text-xs font-sans mt-1">{fieldErrors.address}</p>
                )}
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase font-sans text-charcoal-800/60 mb-2">
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
                  <p className="text-red-500 text-xs font-sans mt-1">{fieldErrors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase font-sans text-charcoal-800/60 mb-2">
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
                  <p className="text-red-500 text-xs font-sans mt-1">{fieldErrors.state}</p>
                )}
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase font-sans text-charcoal-800/60 mb-2">
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
                  <p className="text-red-500 text-xs font-sans mt-1">{fieldErrors.pincode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 p-4">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="font-sans text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-3 py-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Lock size={14} />
            {loading ? 'Processing…' : `Pay ${formatPrice(grandTotal)} Securely`}
          </button>

          <p className="font-sans text-xs text-charcoal-800/40 text-center">
            Secured by Razorpay · 256-bit SSL encryption
          </p>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-cream-100 p-6 sticky top-24">
            <h2 className="font-serif text-xl font-light text-charcoal-900 mb-5">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.product_id} className="flex gap-3">
                  <div className="relative w-14 h-14 bg-cream-200 shrink-0 overflow-hidden">
                    {item.image_url_1 && (
                      <Image src={item.image_url_1} alt={item.name} fill className="object-cover" sizes="56px" />
                    )}
                    <span className="absolute -top-1 -right-1 bg-charcoal-900 text-cream-50 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-xs text-charcoal-900 leading-snug">{item.name}</p>
                    <p className="font-sans text-xs text-charcoal-800/50 mt-1">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-sans text-xs font-medium text-charcoal-900 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm font-sans">
                <span className="text-charcoal-800/60">Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm font-sans">
                <span className="text-charcoal-800/60">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="border-t border-cream-200 pt-3 flex justify-between font-sans font-medium">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
