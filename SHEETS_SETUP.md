# Google Sheets Setup Guide

## Step 1: Create Your Google Sheet

Go to sheets.google.com and create a new spreadsheet named **Aurelia Jewels Store**.

---

## Tab 1: PRODUCTS

**Create a tab named exactly: PRODUCTS**

Add these column headers in Row 1:

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| product_id | name | description | price | discount_price | inventory_count | category | image_url_1 | image_url_2 | image_url_3 | featured | status |

**Example row:**
```
JWL001 | Gold Lotus Necklace | Handmade 22k gold necklace with lotus pendant | 3999 | 3499 | 5 | Necklace | https://res.cloudinary.com/... | | | TRUE | active
```

**Rules:**
- `product_id`: Must be unique. Use format: JWL001, JWL002, etc.
- `status`: Either `active` or `inactive`
- `featured`: Either `TRUE` or `FALSE`
- `discount_price`: Leave blank if no discount
- `image_url_2`, `image_url_3`: Optional extra images

---

## Tab 2: ORDERS

**Create a tab named exactly: ORDERS**

Add these column headers in Row 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| order_id | date | customer_name | phone | email | address | product_id | product_name | quantity | total_price | payment_status | order_status | tracking_number | notes |

**Order Status values:** `new` → `processing` → `shipped` → `delivered`

**Payment Status values:** `pending` or `paid`

**Owner workflow:**
1. Customer places order → row appears automatically
2. You change `order_status` from `new` to `processing` when packing
3. You change to `shipped` and paste the courier tracking number in column M
4. Customer can track using the order tracking page

---

## Tab 3: INVENTORY_LOG

**Create a tab named exactly: INVENTORY_LOG**

Add these column headers in Row 1:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| log_id | product_id | change_type | quantity_change | date | reason |

This is filled automatically by the website. You can view it for audit purposes.

---

## Tab 4: SETTINGS

**Create a tab named exactly: SETTINGS**

Add these column headers in Row 1:

| A | B |
|---|---|
| setting | value |

**Add these rows:**

| setting | value |
|---------|-------|
| store_name | Aurelia Jewels |
| store_logo_url | https://res.cloudinary.com/your-logo.png |
| support_email | hello@aureliajewels.com |
| instagram_url | https://instagram.com/aureliajewels |
| whatsapp_number | 919876543210 |
| tagline | Handcrafted with love, worn with grace. |
| hero_heading | Jewellery that tells your story |
| hero_image_url | https://res.cloudinary.com/your-hero.jpg |

---

## Step 2: Create Google Service Account

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable **Google Sheets API**:
   - APIs & Services → Enable APIs
   - Search "Google Sheets API" → Enable
4. Create Service Account:
   - APIs & Services → Credentials → Create Credentials → Service Account
   - Name it: `jewelry-store-bot`
   - Click Create and Continue
   - Skip optional steps
5. Download JSON key:
   - Click on the service account you created
   - Keys tab → Add Key → Create New Key → JSON
   - Download the file

6. **Share your Google Sheet** with the service account email
   - Open your Google Sheet
   - Click Share
   - Paste the service account email (looks like: `jewelry-store-bot@your-project.iam.gserviceaccount.com`)
   - Set permission to **Editor**

---

## Step 3: Set Environment Variables

From the downloaded JSON key file, extract:

```
GOOGLE_SHEETS_CLIENT_EMAIL = "client_email" value from JSON
GOOGLE_SHEETS_PRIVATE_KEY = "private_key" value from JSON
GOOGLE_SHEET_ID = The long ID from your Sheet URL
```

The Sheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/[THIS-IS-YOUR-SHEET-ID]/edit
```

---

## Image Management - Google Drive

The store uses Google Drive for product images. No Cloudinary account needed.

### How to add product images

1. Open your Google Drive
2. Create a folder called **Product Images** (optional but recommended)
3. Upload your product photo (JPG or PNG, ideally square or 3:4 portrait)
4. Right-click the file -> **Share** -> change access to **"Anyone with the link can view"**
5. Click **Copy link** - it will look like:
   `https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/view?usp=sharing`
6. Paste that link directly into `image_url_1` in the PRODUCTS sheet
7. The website converts it automatically - no extra steps needed

### Tips
- You can add up to 3 images per product (`image_url_1`, `image_url_2`, `image_url_3`)
- Leave `image_url_2` and `image_url_3` blank if you only have one photo
- Make sure sharing is set to "Anyone with the link" - private links will show broken images
- For best results, use square (1:1) or portrait (3:4) photos with a clean background
- File size under 5 MB loads fastest

---

## Step 5: Managing Orders (Daily Workflow)

1. Open ORDERS tab
2. New orders appear at the bottom
3. To update status:
   - Change column L (`order_status`) to: `processing`, `shipped`, or `delivered`
   - If shipped, paste courier tracking number in column M
4. Customers can track their order at: `yourwebsite.com/order-tracking`

---

## Category Names

Use these exact category names for the `category` column:
- `Necklace`
- `Earring`
- `Ring`
- `Bracelet`

(The website navigation links to these categories)
