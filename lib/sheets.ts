// lib/sheets.ts
import { google } from 'googleapis';
import type { Product, Order, InventoryLog, StoreSettings } from '@/types';
import { toDriveImageUrl } from '@/lib/utils';

// ── Singleton Sheets client ───────────────────────────────────────────────────
let sheetsClientInstance: ReturnType<typeof google.sheets> | null = null;

function getSheetsClient() {
  if (sheetsClientInstance) return sheetsClientInstance;

  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error('Missing Google Sheets credentials in environment variables.');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClientInstance = google.sheets({ version: 'v4', auth });
  return sheetsClientInstance;
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

// ── In-memory cache (60s TTL) ─────────────────────────────────────────────────
interface CacheEntry<T> { data: T; expiresAt: number; }
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 60_000;

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data as T;
}
function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}
function invalidateCache(key: string): void { cache.delete(key); }

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const cached = getCache<Product[]>('products');
  if (cached) return cached;

  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'PRODUCTS!A2:L',
    });
    const rows = response.data.values || [];
    const products = rows
      .map(rowToProduct)
      .filter((p): p is Product => p !== null && p.status === 'active');
    setCache('products', products);
    return products;
  } catch (error) {
    console.error('getProducts error:', error);
    throw new Error('Failed to fetch products from Google Sheets.');
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const products = await getProducts();
    return products.find((p) => p.product_id === productId) || null;
  } catch (error) {
    console.error('getProductById error:', error);
    return null;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.featured);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}

export async function getCategories(): Promise<string[]> {
  const products = await getProducts();
  const cats = [...new Set(products.map((p) => p.category))];
  return cats.filter(Boolean);
}

function rowToProduct(row: string[]): Product | null {
  if (!row[0]) return null;
  return {
    product_id: row[0] || '',
    name: row[1] || '',
    description: row[2] || '',
    price: parseFloat(row[3]) || 0,
    discount_price: row[4] ? parseFloat(row[4]) : null,
    inventory_count: parseInt(row[5]) || 0,
    category: row[6] || '',
    image_url_1: toDriveImageUrl(row[7] || ''),
    image_url_2: toDriveImageUrl(row[8] || ''),
    image_url_3: toDriveImageUrl(row[9] || ''),
    featured: row[10]?.toUpperCase() === 'TRUE',
    status: (row[11] as 'active' | 'inactive') || 'active',
  };
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export interface CreateOrderParams {
  order_id: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  payment_status?: 'paid' | 'pending';
  notes?: string;
}

export async function createOrder(params: CreateOrderParams): Promise<void> {
  try {
    const sheets = getSheetsClient();
    const date = new Date().toISOString().split('T')[0];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'ORDERS!A:N',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          params.order_id,
          date,
          params.customer_name,
          params.phone,
          params.email,
          params.address,
          params.product_id,
          params.product_name,
          params.quantity,
          params.total_price,
          params.payment_status ?? 'paid',
          'new',
          '',
          params.notes ?? '',
        ]],
      },
    });
  } catch (error) {
    console.error('createOrder error:', error);
    throw new Error('Failed to create order in Google Sheets.');
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'ORDERS!A2:N',
      valueRenderOption: 'UNFORMATTED_VALUE',
    });
    const rows = response.data.values || [];
    return rows
      .filter((row) => row[0])
      .map((row) => ({
        order_id:        String(row[0] ?? '').trim(),
        date:            String(row[1] ?? '').trim(),
        customer_name:   String(row[2] ?? '').trim(),
        phone:           String(row[3] ?? '').trim(),
        email:           String(row[4] ?? '').trim(),
        address:         String(row[5] ?? '').trim(),
        product_id:      String(row[6] ?? '').trim(),
        product_name:    String(row[7] ?? '').trim(),
        quantity:        parseInt(String(row[8] ?? '0')) || 0,
        total_price:     parseFloat(String(row[9] ?? '0')) || 0,
        payment_status:  (String(row[10] ?? '').toLowerCase().trim() as 'pending' | 'paid') || 'pending',
        order_status:    (String(row[11] ?? '').toLowerCase().trim() as Order['order_status']) || 'new',
        tracking_number: String(row[12] ?? '').trim(),
        notes:           String(row[13] ?? '').trim(),
      }));
  } catch (error) {
    console.error('getOrders error:', error);
    throw new Error('Failed to fetch orders.');
  }
}

// Fetches directly from Sheets every time — never cached.
// Orders change status/payment frequently so we always want fresh data.
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'ORDERS!A2:N',
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const rows = response.data.values || [];
    const row = rows.find((r) => String(r[0] ?? '').trim() === orderId.trim());
    if (!row) return null;

    return {
      order_id:        String(row[0] ?? '').trim(),
      date:            String(row[1] ?? '').trim(),
      customer_name:   String(row[2] ?? '').trim(),
      phone:           String(row[3] ?? '').trim(),
      email:           String(row[4] ?? '').trim(),
      address:         String(row[5] ?? '').trim(),
      product_id:      String(row[6] ?? '').trim(),
      product_name:    String(row[7] ?? '').trim(),
      quantity:        parseInt(String(row[8] ?? '0')) || 0,
      total_price:     parseFloat(String(row[9] ?? '0')) || 0,
      payment_status:  (String(row[10] ?? '').toLowerCase().trim() as 'pending' | 'paid') || 'pending',
      order_status:    (String(row[11] ?? '').toLowerCase().trim() as Order['order_status']) || 'new',
      tracking_number: String(row[12] ?? '').trim(),
      notes:           String(row[13] ?? '').trim(),
    };
  } catch (error) {
    console.error('getOrderById error:', error);
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['order_status'],
  trackingNumber?: string
): Promise<void> {
  try {
    const sheets = getSheetsClient();
    const orders = await getOrders();
    const rowIndex = orders.findIndex((o) => o.order_id === orderId);
    if (rowIndex === -1) throw new Error(`Order ${orderId} not found`);
    const sheetRow = rowIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `ORDERS!L${sheetRow}:M${sheetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[status, trackingNumber || '']] },
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    throw new Error('Failed to update order status.');
  }
}

// ─── INVENTORY ───────────────────────────────────────────────────────────────

export async function updateInventory(
  productId: string,
  quantityChange: number,
  reason: string,
  changeType: InventoryLog['change_type'] = 'sale'
): Promise<void> {
  try {
    const sheets = getSheetsClient();

    const productResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'PRODUCTS!A2:F',
    });

    const rows = productResponse.data.values || [];
    const rowIndex = rows.findIndex((r) => r[0] === productId);
    if (rowIndex === -1) throw new Error(`Product ${productId} not found`);

    const currentCount = parseInt(rows[rowIndex][5]) || 0;
    const newCount = Math.max(0, currentCount + quantityChange);
    const sheetRow = rowIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `PRODUCTS!F${sheetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[newCount]] },
    });

    const logId = `LOG${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'INVENTORY_LOG!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[logId, productId, changeType, quantityChange, date, reason]],
      },
    });

    invalidateCache('products');
  } catch (error) {
    console.error('updateInventory error:', error);
    throw new Error('Failed to update inventory.');
  }
}

// ─── SUBSCRIBERS ─────────────────────────────────────────────────────────────

export async function addSubscriber(email: string): Promise<void> {
  try {
    const sheets = getSheetsClient();

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'SUBSCRIBERS!A2:A',
    });

    const existingEmails = (existing.data.values || []).map((r) => r[0]?.toLowerCase().trim());
    if (existingEmails.includes(email.toLowerCase().trim())) {
      throw new Error('ALREADY_SUBSCRIBED');
    }

    const date = new Date().toISOString().split('T')[0];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'SUBSCRIBERS!A:B',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[email.toLowerCase().trim(), date]],
      },
    });
  } catch (error: any) {
    if (error?.message === 'ALREADY_SUBSCRIBED') throw error;
    console.error('addSubscriber error:', error);
    throw new Error('Failed to add subscriber.');
  }
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<StoreSettings> {
  const cached = getCache<StoreSettings>('settings');
  if (cached) return cached;

  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'SETTINGS!A2:B',
    });

    const rows = response.data.values || [];
    const settingsMap: Record<string, string> = {};
    rows.forEach(([key, value]) => {
      if (key) settingsMap[key] = value || '';
    });

    const settings: StoreSettings = {
      store_name:      settingsMap['store_name']      || 'Aurelia Jewels',
      store_logo_url:  settingsMap['store_logo_url']  || '',
      support_email:   settingsMap['support_email']   || 'hello@aureliajewels.com',
      instagram_url:   settingsMap['instagram_url']   || 'https://instagram.com',
      whatsapp_number: settingsMap['whatsapp_number'] || '',
      tagline:         settingsMap['tagline']         || 'Handcrafted with love, worn with grace.',
      hero_image_url:  settingsMap['hero_image_url']  || '',
      hero_heading:    settingsMap['hero_heading']    || 'Jewellery that tells your story',
    };

    setCache('settings', settings);
    return settings;
  } catch (error) {
    console.error('getSettings error:', error);
    return {
      store_name:     'Aurelia Jewels',
      store_logo_url: '',
      support_email:  'hello@aureliajewels.com',
      instagram_url:  'https://instagram.com',
      tagline:        'Handcrafted with love, worn with grace.',
      hero_heading:   'Jewellery that tells your story',
    };
  }
}