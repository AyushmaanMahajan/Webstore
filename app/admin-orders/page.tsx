'use client';
// app/admin-orders/page.tsx
import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/orders', {
      headers: { 'x-admin-secret': secret },
    });

    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
      setAuthed(true);
    } else {
      setError('Invalid secret key. Access denied.');
    }
    setLoading(false);
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.order_status === filter);

  const stats = {
    total: orders.length,
    revenue: orders.filter((o) => o.payment_status === 'paid').reduce((s, o) => s + o.total_price, 0),
    new: orders.filter((o) => o.order_status === 'new').length,
    shipped: orders.filter((o) => o.order_status === 'shipped').length,
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <h1 className="font-serif text-3xl font-light text-charcoal-900 text-center mb-8">
            Admin Access
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="input-field"
              placeholder="Enter admin secret key"
            />
            {error && <p className="font-sans text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? 'Verifying…' : 'Access Orders'}
            </button>
          </form>
          <p className="font-sans text-xs text-charcoal-800/40 text-center mt-6">
            Manage orders directly in Google Sheets for full control.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-light text-charcoal-900">
            Orders Dashboard
          </h1>
          <span className="font-sans text-xs tracking-widest uppercase text-charcoal-800/40">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: stats.total },
            { label: 'Revenue', value: formatPrice(stats.revenue) },
            { label: 'New Orders', value: stats.new },
            { label: 'Shipped', value: stats.shipped },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-cream-200 p-5">
              <p className="font-sans text-xs tracking-widest uppercase text-charcoal-800/40 mb-2">{stat.label}</p>
              <p className="font-serif text-2xl font-light text-charcoal-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'new', 'processing', 'shipped', 'delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 text-xs tracking-widest uppercase font-sans transition-all ${
                filter === s
                  ? 'bg-charcoal-900 text-cream-50'
                  : 'border border-cream-200 text-charcoal-800/60 hover:border-charcoal-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Orders table */}
        <div className="bg-white border border-cream-200 overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50">
                {['Order ID', 'Date', 'Customer', 'Product', 'Total', 'Payment', 'Status', 'Tracking'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs tracking-widest uppercase text-charcoal-800/40 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-charcoal-800/40">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={`${order.order_id}-${order.product_id}`} className="border-b border-cream-200/50 hover:bg-cream-50">
                    <td className="px-4 py-3 font-mono text-xs text-charcoal-800">{order.order_id}</td>
                    <td className="px-4 py-3 text-charcoal-800/60">{order.date}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-charcoal-900 font-medium">{order.customer_name}</p>
                        <p className="text-charcoal-800/40 text-xs">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-charcoal-800">{order.product_name} ×{order.quantity}</td>
                    <td className="px-4 py-3 font-medium text-charcoal-900">{formatPrice(order.total_price)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[order.payment_status] || ''}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[order.order_status] || ''}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-charcoal-800/60 text-xs">
                      {order.tracking_number || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="font-sans text-xs text-charcoal-800/30 mt-6 text-center">
          To update order status or add tracking numbers, edit the ORDERS sheet directly in Google Sheets.
        </p>
      </div>
    </div>
  );
}
