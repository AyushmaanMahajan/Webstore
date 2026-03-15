// types/index.ts

export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  inventory_count: number;
  category: string;
  image_url_1: string;
  image_url_2: string;
  image_url_3: string;
  featured: boolean;
  status: 'active' | 'inactive';
}

export interface Order {
  order_id: string;
  date: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  payment_status: 'pending' | 'paid';
  order_status: 'new' | 'processing' | 'shipped' | 'delivered';
  tracking_number: string;
  notes: string;
}

export interface InventoryLog {
  log_id: string;
  product_id: string;
  change_type: 'sale' | 'restock' | 'adjustment';
  quantity_change: number;
  date: string;
  reason: string;
}

export interface StoreSettings {
  store_name: string;
  store_logo_url: string;
  support_email: string;
  instagram_url: string;
  whatsapp_number?: string;
  tagline?: string;
  hero_image_url?: string;
  hero_heading?: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image_url_1: string;
  quantity: number;
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface CheckoutPayload {
  cart: CartItem[];
  customer: CheckoutFormData;
}
