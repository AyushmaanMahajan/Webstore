# Aurelia Jewels — E-Commerce Store

A production-ready jewellery e-commerce website powered by **Next.js 14**, **Google Sheets** as the CMS, and **Razorpay** for payments. Designed for non-technical operators — manage everything from a spreadsheet.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TailwindCSS |
| Database / CMS | Google Sheets API v4 |
| Payments | Razorpay |
| Images | Cloudinary |
| Hosting | Vercel |
| Language | TypeScript |

---

## Features

- ✅ Full product catalogue from Google Sheets (auto-refreshes every 60s)
- ✅ Category filtering, featured products, stock status
- ✅ Product gallery with multiple images
- ✅ Cart using localStorage (persists across sessions)
- ✅ Checkout with server-side stock validation
- ✅ Razorpay payment with signature verification
- ✅ Order creation in Google Sheets on payment success
- ✅ Inventory auto-deducted on purchase
- ✅ Inventory log for audit trail
- ✅ Order tracking page (public)
- ✅ Admin orders dashboard (secret-protected)
- ✅ Rate limiting on checkout API
- ✅ Input sanitization and validation
- ✅ ISR — no redeploy needed when updating products
- ✅ Mobile optimised, luxury minimal design
- ✅ Error pages, loading skeletons, out-of-stock states

---

## Project Structure

```
jewelry-store/
├── app/
│   ├── layout.tsx              # Root layout with Navbar + Footer
│   ├── page.tsx                # Homepage (Hero, Featured, Categories)
│   ├── globals.css             # Global styles + Tailwind
│   ├── not-found.tsx           # 404 page
│   ├── error.tsx               # Error boundary
│   ├── shop/
│   │   └── page.tsx            # Shop with category filters
│   ├── product/[id]/
│   │   └── page.tsx            # Product detail page
│   ├── cart/
│   │   └── page.tsx            # Cart page
│   ├── checkout/
│   │   └── page.tsx            # Checkout + Razorpay
│   ├── order-success/
│   │   └── page.tsx            # Post-payment success
│   ├── order-tracking/
│   │   └── page.tsx            # Public order tracker
│   ├── admin-orders/
│   │   └── page.tsx            # Password-protected admin view
│   └── api/
│       ├── products/route.ts           # GET products
│       ├── products/[id]/route.ts      # GET single product
│       ├── orders/route.ts             # GET orders (admin)
│       ├── orders/track/route.ts       # GET order tracking (public)
│       ├── checkout/route.ts           # POST create Razorpay order
│       └── checkout/verify/route.ts    # POST verify payment + create order
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Sticky nav with cart icon
│   │   └── Footer.tsx          # Footer with links
│   └── shop/
│       ├── CartProvider.tsx     # Cart context + localStorage
│       ├── ProductCard.tsx      # Product card with quick-add
│       ├── ProductGallery.tsx   # Image gallery with thumbnails
│       ├── AddToCartSection.tsx # Qty selector + add/buy now
│       └── ShopFilters.tsx      # Category filter buttons
├── lib/
│   ├── sheets.ts               # All Google Sheets functions
│   ├── razorpay.ts             # Razorpay helpers
│   ├── rate-limit.ts           # IP-based rate limiter
│   └── utils.ts                # Formatting, validation helpers
├── types/
│   └── index.ts                # TypeScript interfaces
├── SHEETS_SETUP.md             # Non-technical owner guide
├── .env.example                # Environment variable template
├── next.config.js
├── tailwind.config.js
└── vercel.json
```

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your credentials (see below).

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:50004](http://localhost:50004)

---

## Environment Variables

Create `.env.local` with:

```env
# Google Sheets
GOOGLE_SHEETS_CLIENT_EMAIL=your-bot@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Admin dashboard
ADMIN_SECRET=choose-a-long-random-string-here

# App URL
NEXT_PUBLIC_APP_URL=https://your-store.vercel.app
```

**Getting Google credentials:** See `SHEETS_SETUP.md`

**Getting Razorpay keys:**
1. Sign up at [razorpay.com](https://razorpay.com)
2. Dashboard → Settings → API Keys → Generate Key
3. Use Test keys during development, Live keys for production

---

## Google Sheets Setup

See the complete guide in **`SHEETS_SETUP.md`**.

Quick summary:
1. Create a Google Sheet with 4 tabs: `PRODUCTS`, `ORDERS`, `INVENTORY_LOG`, `SETTINGS`
2. Create a Google Service Account
3. Share the Sheet with the service account email (Editor access)
4. Copy credentials to `.env.local`

---

## Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B: GitHub → Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Add all environment variables in Vercel dashboard
5. Deploy

**Important:** In Vercel dashboard, add each environment variable from `.env.example`. For `GOOGLE_SHEETS_PRIVATE_KEY`, paste the full key including `-----BEGIN...` and `-----END...` lines.

---

## Owner Daily Workflow

### Adding a new product
1. Upload image to Cloudinary → copy URL
2. Open Google Sheet → PRODUCTS tab
3. Add a new row with product details
4. Set `status` = `active`, paste image URL
5. Website updates within **60 seconds** ✓

### Managing orders
1. Open Google Sheet → ORDERS tab
2. New orders appear automatically at bottom
3. Change `order_status` column:
   - `new` → `processing` → `shipped` → `delivered`
4. Paste courier tracking number when shipped
5. Customer can track at `/order-tracking`

### Adjusting inventory
1. Open PRODUCTS tab
2. Update `inventory_count` column
3. Website reflects change within 60 seconds

---

## Customisation

### Store name and branding
Edit SETTINGS tab in Google Sheet:
- `store_name` — appears in header and footer
- `tagline` — shown on homepage
- `hero_heading` — hero banner text
- `hero_image_url` — hero background image (from Cloudinary)
- `store_logo_url` — replaces text logo if provided
- `instagram_url` — Instagram link in footer

### Colours
Edit `tailwind.config.js` → `theme.extend.colors`:
- `gold` — accent colour throughout
- `cream` — background tones
- `charcoal` — text and dark elements

### Categories
The default navigation shows: Necklaces, Earrings, Rings, Bracelets.
To add a category:
1. Use the new category name in PRODUCTS sheet
2. Edit `NAV_LINKS` in `components/layout/Navbar.tsx`

### Shipping cost
Edit `app/cart/page.tsx` and `app/checkout/page.tsx`:
```typescript
const shipping = totalPrice >= 999 ? 0 : 99; // Change 999 and 99
```

---

## Security Notes

- Stock is validated **server-side** before creating payment order
- Prices are fetched from Google Sheets server-side — client can't manipulate price
- Razorpay signature is verified before creating order in Sheets
- Input is sanitized before writing to Sheets
- Checkout API is rate-limited: 5 requests/minute per IP
- Admin orders page requires a secret key
- Order tracking requires matching order ID + email

---

## ISR (Incremental Static Regeneration)

All product pages use `export const revalidate = 60` which means:
- Pages are cached on Vercel edge for 60 seconds
- After 60 seconds, next request triggers a background refresh
- **No manual redeploy needed** when you update products in Google Sheet

---

## Admin Dashboard

Visit `/admin-orders` and enter your `ADMIN_SECRET` to view:
- All orders in a table
- Filter by status
- Revenue summary
- Order details

For full management (updating status, adding tracking), edit the ORDERS sheet directly.

---

## Support

For questions or customisations, check:
- `SHEETS_SETUP.md` — Google Sheets configuration
- `.env.example` — all required environment variables
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Razorpay docs: [razorpay.com/docs](https://razorpay.com/docs)
