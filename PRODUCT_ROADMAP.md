# Goresto - Product Roadmap

## Current MVP (Built)

| Feature | Status |
|---------|--------|
| Multi-restaurant SaaS with Super Admin | Done |
| Menu Management (images, dietary info, allergens, labels) | Done |
| Order Management with status tracking | Done |
| Table Management (capacity, location, status) | Done |
| Staff Management (roles, status, contact info) | Done |
| QR Code Public Menu for customers | Done |
| Customer Order Placement (no auth required) | Done |
| Order Status Checking by customer | Done |
| Reviews & Ratings system | Done |
| Business Analytics (revenue, popular items, trends) | Done |
| Restaurant Settings (branding, hours, currency, taxes) | Done |
| JWT Auth with refresh token rotation | Done |
| Responsive mobile-first UI | Done |

---

## Phase 1: Make It Launchable (Priority - Ship First)

### 1. Kitchen Display System (KDS)

**Problem:**
Restaurants currently rely on shouting orders, paper tickets, or memory. Orders get missed, delayed, or mixed up during rush hours. There's no visibility into what's being prepared and what's ready.

**Solution:**
A dedicated screen/tablet view for kitchen staff that shows incoming orders in real-time with clear visual status tracking.

**Features:**
- Separate `/kitchen/:restaurantId` route (full-screen, no navigation clutter)
- Auto-refresh / real-time order feed (WebSocket or polling)
- Orders displayed as cards with:
  - Table number (prominent)
  - Item list with quantities
  - Special notes/instructions highlighted
  - Time elapsed since order was placed (color-coded: green < 10min, yellow < 20min, red > 20min)
- One-tap status updates: `New` → `Preparing` → `Ready` → `Served`
- Sound/visual alert for new incoming orders
- Filter by status (show only "New" or "Preparing")
- Order priority highlighting (older orders get attention)
- Auto-archive completed orders (move to bottom / hide)
- Works on tablet (optimized for 10" screens)

**Tech Approach:**
- New page: `src/pages/KitchenDisplay.jsx`
- Uses existing order API endpoints (`GET /orders`, `PATCH /orders/:id/status`)
- Polling every 5-10 seconds (upgrade to WebSocket later)
- No auth required for kitchen view OR simple PIN-based access
- LocalStorage for kitchen settings (alert sound on/off, font size)

**Database Changes:**
- None required (uses existing Order model)
- Optional: Add `kitchenPin` field to Settings model for basic access control

**Impact:** HIGH - This is the #1 daily operational pain point. Eliminates order confusion, reduces prep time, and makes kitchen operations visible.

---

### 2. WhatsApp/SMS Order Notifications

**Problem:**
No restaurant owner sits watching a dashboard all day. They're in the kitchen, talking to customers, managing staff. When a new order comes in (especially from the public QR menu), they have no way to know unless they keep checking the dashboard.

**Solution:**
Instant WhatsApp/SMS notifications for key events - new orders, order status changes, and daily summaries.

**Features:**

**For Restaurant Owner/Staff:**
- New order notification: "New order #12 from Table 5 - 3 items - Rs.850"
- Order includes item summary
- Daily end-of-day summary: "Today: 45 orders, Rs.23,500 revenue"
- Low stock alerts (when inventory is added later)
- Configurable: choose which events trigger notifications
- Multiple phone numbers (owner + manager)

**For Customers:**
- Order confirmed: "Your order #12 has been accepted! Estimated time: 20 min"
- Order ready: "Your order is ready! Please collect from the counter"
- Optional: feedback request after order completion

**Settings:**
- Enable/disable notifications per type
- Add multiple recipient phone numbers
- Quiet hours (no notifications between 12am-7am)
- Choose WhatsApp / SMS / Both

**Tech Approach:**
- Integration options (in priority order):
  1. **Twilio WhatsApp Business API** - most reliable, ~Rs.0.50/message
  2. **MSG91** - Indian alternative, cheaper for SMS
  3. **WhatsApp Cloud API (Meta)** - free tier available, more setup
- New server module: `server/services/notificationService.js`
- Notification queue to avoid blocking order flow
- Template-based messages (pre-approved WhatsApp templates)
- Webhook endpoint for delivery status tracking

**Database Changes:**
- Add to Settings model:
  - `notificationPhone` (String[]) - recipient numbers
  - `notificationPreferences` (JSON) - which events to notify
  - `whatsappEnabled` (Boolean)
  - `smsEnabled` (Boolean)

**Impact:** HIGH - Bridges the gap between digital system and real-world restaurant operations. Without this, the QR ordering system is effectively useless during busy hours.

---

### 3. Billing & Invoice Generation

**Problem:**
Every restaurant needs to print bills. Customers expect a proper bill with tax breakdown. Owners need it for accounting and GST compliance. Currently, there's no way to generate a formatted bill from an order.

**Solution:**
Generate professional, print-ready bills/invoices from orders with full tax breakdown, restaurant branding, and thermal printer compatibility.

**Features:**

**Bill Generation:**
- Generate bill from any completed/served order
- Auto-calculate:
  - Subtotal (sum of items)
  - Tax (GST/VAT based on settings)
  - Service charge (if enabled)
  - Discount (if applied)
  - Grand total
- Bill number auto-increment (daily reset or continuous)
- Payment mode selection: Cash / Card / UPI / Split

**Bill Format:**
- Restaurant name, address, phone, GST number
- Bill number and date/time
- Table number
- Itemized list with quantity and price
- Tax breakdown (CGST + SGST for India, or single GST)
- Service charge line
- Discount line (if any)
- Grand total (bold, prominent)
- Footer: "Thank you for dining with us!"
- QR code for feedback/review (optional)

**Print Support:**
- Thermal printer format (80mm and 58mm width)
- A4/A5 format for formal invoices
- Browser print dialog (window.print with print-specific CSS)
- PDF download option

**Daily Summary:**
- End-of-day sales report
- Total bills generated
- Payment mode breakdown (Cash vs Card vs UPI)
- Total tax collected

**Tech Approach:**
- New component: `src/components/BillGenerator.jsx`
- Print CSS stylesheet for thermal printer formatting
- PDF generation using `jsPDF` or `react-pdf`
- Bill data derived from existing Order model
- New bill number sequence in database

**Database Changes:**
- New `Bill` model:
  - `id`, `billNumber`, `orderId`, `restaurantId`
  - `subtotal`, `taxAmount`, `serviceCharge`, `discount`, `total`
  - `paymentMode` (cash/card/upi/split)
  - `gstNumber` (from settings)
  - `createdAt`
- Add to Settings: `gstNumber`, `billPrefix` (e.g., "GR-"), `showServiceCharge`

**Impact:** HIGH - Operational necessity. No restaurant can function without billing. Also critical for tax compliance (GST filing).

---

### 4. Daily Expense Tracker

**Problem:**
Most restaurant owners have zero visibility into daily expenses. They buy vegetables in the morning, pay the gas bill, handle a repair, and by month end have no idea where the money went. They know revenue (from orders) but not profit.

**Solution:**
Simple daily expense logging with categorization and a clear Profit & Loss view.

**Features:**

**Expense Entry:**
- Quick-add expense: amount + category + note + date
- Predefined categories:
  - Raw Materials (vegetables, meat, spices, dairy)
  - Beverages (drinks, water, ice)
  - Kitchen Supplies (oil, gas, cleaning)
  - Staff Salaries
  - Rent
  - Utilities (electricity, water bill, internet)
  - Maintenance & Repairs
  - Marketing & Advertising
  - Packaging (takeaway containers, bags)
  - Miscellaneous
- Custom categories (add your own)
- Recurring expenses (rent, salaries - auto-add monthly)
- Photo/receipt upload (optional, for record keeping)
- Vendor/supplier name (optional)

**Dashboard View:**
- Today's expenses vs today's revenue (simple profit indicator)
- Weekly expense breakdown by category (bar chart)
- Monthly P&L statement:
  ```
  Revenue:        Rs. 4,50,000
  - Expenses:     Rs. 3,20,000
  ─────────────────────────────
  Gross Profit:   Rs. 1,30,000
  Profit Margin:  28.9%
  ```
- Category-wise spending pie chart
- Expense trends (this month vs last month)
- Top 3 expense categories highlighted

**Reports:**
- Daily expense report
- Weekly summary
- Monthly P&L
- Category-wise breakdown
- Export to CSV/Excel

**Tech Approach:**
- New page tab in Restaurant Admin Dashboard: "Expenses"
- New components: `ExpenseForm.jsx`, `ExpenseList.jsx`, `ProfitLossCard.jsx`
- New API routes: `/restaurants/:id/expenses` (CRUD)
- Integrate with existing Analytics tab for combined revenue + expense view

**Database Changes:**
- New `Expense` model:
  - `id`, `restaurantId`
  - `amount` (Float)
  - `category` (String)
  - `description` (String)
  - `date` (DateTime)
  - `vendorName` (String, optional)
  - `receiptImage` (Text, optional - base64)
  - `isRecurring` (Boolean, default: false)
  - `recurringFrequency` (monthly/weekly, optional)
  - `createdAt`, `updatedAt`
- New `ExpenseCategory` model (optional, for custom categories):
  - `id`, `restaurantId`, `name`, `icon`

**Impact:** HIGH - Transforms Goresto from an "order management tool" into a "business management tool." Owners finally see if they're making or losing money. This insight alone can justify the subscription cost.

---

## Phase 2: Daily Operations Solver (Month 1-2)

| # | Feature | Description |
|---|---------|-------------|
| 5 | Inventory/Stock Management | Track ingredients, auto-deduct on orders, low stock alerts |
| 6 | Staff Attendance & Shifts | Clock in/out, shift scheduling, working hours calculation |
| 7 | Customer Database (CRM Lite) | Auto-save customer info, visit history, frequent customer list |
| 8 | Table Floor Map | Visual layout of tables with live order status |

## Phase 3: Growth & Competitive Edge (Month 2-4)

| # | Feature | Description |
|---|---------|-------------|
| 9 | Online Ordering + Payments | Razorpay/Stripe integration, takeaway & delivery support |
| 10 | Loyalty/Rewards Program | Points system, redeem for discounts, birthday offers |
| 11 | Multi-language Menu | Menu in English + regional language |
| 12 | Table Reservation System | Online booking with time slots, auto-confirmation |

## Phase 4: Premium Features (Month 4+)

| # | Feature | Description |
|---|---------|-------------|
| 13 | Supplier Management | Vendor contacts, purchase tracking, auto purchase orders |
| 14 | Feedback & Complaint Management | Post-meal feedback, complaint resolution, Google Review prompts |
| 15 | Multi-Branch Support | One owner, multiple locations, centralized management |
| 16 | AI Menu Optimization | Sales analysis, price suggestions, underperforming item detection |

---

## Pricing Strategy

| Plan | Price (Monthly) | Features | Target |
|------|----------------|----------|--------|
| **Free** | Rs. 0 | QR Menu + Public ordering only | Lead generation |
| **Starter** | Rs. 999 | Menu + Orders + Tables + Billing (1 user) | Small restaurants |
| **Pro** | Rs. 2,499 | Everything + KDS + Inventory + Expenses (5 users) | Medium restaurants |
| **Business** | Rs. 4,999 | Multi-branch + API + Reports + Unlimited users | Chains |

---

## Implementation Priority

```
Week 1-2:  Kitchen Display System (KDS)
Week 3-4:  WhatsApp/SMS Notifications
Week 5-6:  Billing & Invoice Generation
Week 7-8:  Daily Expense Tracker
```

Each feature should be developed, tested, and deployed independently so the product gets progressively better with each release.
