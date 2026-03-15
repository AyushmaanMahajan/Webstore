// lib/sheets.ts
import { google } from 'googleapis';
import type { Product, Order, InventoryLog, StoreSettings } from '@/types';
import { toDriveImageUrl } from '@/lib/utils';

function getAuth() {
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error('Missing Google Sheets credentials in environment variables.');
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

// ─── PRODUCTS ──────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'PRODUCTS!A2:L',
    });

    const rows = response.data.values || [];
    return rows
      .map(rowToProduct)
      .filter((p): p is Product => p !== null && p.status === 'active');
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

// ─── ORDERS ────────────────────────────────────────────────────────────────────

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
        values: [
          [
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
            'paid',
            'new',
            '',
            '',
          ],
        ],
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
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
      order_id: row[0] || '',
      date: row[1] || '',
      customer_name: row[2] || '',
      phone: row[3] || '',
      email: row[4] || '',
      address: row[5] || '',
      product_id: row[6] || '',
      product_name: row[7] || '',
      quantity: parseInt(row[8]) || 0,
      total_price: parseFloat(row[9]) || 0,
      payment_status: (row[10] as 'pending' | 'paid') || 'pending',
      order_status: (row[11] as Order['order_status']) || 'new',
      tracking_number: row[12] || '',
      notes: row[13] || '',
    }));
  } catch (error) {
    console.error('getOrders error:', error);
    throw new Error('Failed to fetch orders.');
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.order_id === orderId) || null;
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
      requestBody: {
        values: [[status, trackingNumber || '']],
      },
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    throw new Error('Failed to update order status.');
  }
}

// ─── INVENTORY ─────────────────────────────────────────────────────────────────

export async function updateInventory(
  productId: string,
  quantityChange: number,
  reason: string,
  changeType: InventoryLog['change_type'] = 'sale'
): Promise<void> {
  try {
    const sheets = getSheetsClient();

    // 1) Get current inventory from PRODUCTS sheet
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

    // 2) Update inventory_count column (F = col 6)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `PRODUCTS!F${sheetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newCount]],
      },
    });

    // 3) Append to INVENTORY_LOG
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
  } catch (error) {
    console.error('updateInventory error:', error);
    throw new Error('Failed to update inventory.');
  }
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<StoreSettings> {
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

    return {
      store_name: settingsMap['store_name'] || 'Aurelia Jewels',
      store_logo_url: settingsMap['store_logo_url'] || '',
      support_email: settingsMap['support_email'] || 'hello@aureliajewels.com',
      instagram_url: settingsMap['instagram_url'] || 'https://instagram.com',
      whatsapp_number: settingsMap['whatsapp_number'] || '',
      tagline: settingsMap['tagline'] || 'Handcrafted with love, worn with grace.',
      hero_image_url: settingsMap['hero_image_url'] || '',
      hero_heading: settingsMap['hero_heading'] || 'Jewellery that tells your story',
    };
  } catch (error) {
    console.error('getSettings error:', error);
    // Return safe defaults if sheet fails
    return {
      store_name: 'Aurelia Jewels',
      store_logo_url: '',
      support_email: 'hello@aureliajewels.com',
      instagram_url: 'https://instagram.com',
      tagline: 'Handcrafted with love, worn with grace.',
      hero_heading: 'Jewellery that tells your story',
    };
  }
}
