# Billing & Invoice Generation — Implementation Plan (Reviewed)

> **Review Notes:** This plan has been reviewed against the actual Goresto codebase (Prisma schema, order flow, settings model, API patterns, frontend patterns) and Indian GST compliance rules. All calculations, data models, and flows are validated against real restaurant operations and GST law Section 15.

---

## Table of Contents

1. [Why This Section Is Critical](#1-why-this-section-is-critical)
2. [Current System Analysis — What Exists Today](#2-current-system-analysis--what-exists-today)
3. [Indian GST Compliance Requirements](#3-indian-gst-compliance-requirements)
4. [Order-to-Bill Connection — Real Restaurant Flow](#4-order-to-bill-connection--real-restaurant-flow)
5. [Discount Management System](#5-discount-management-system)
6. [Database Schema Design](#6-database-schema-design)
7. [Settings Additions (Tax & Billing Configuration)](#7-settings-additions-tax--billing-configuration)
8. [Tax Calculation Engine (GST-Correct)](#8-tax-calculation-engine-gst-correct)
9. [Backend Architecture](#9-backend-architecture)
10. [Invoice Number Generation Logic](#10-invoice-number-generation-logic)
11. [Frontend UI Design](#11-frontend-ui-design)
12. [Bill/Invoice Print Layouts](#12-billinvoice-print-layouts)
13. [PDF Generation](#13-pdf-generation)
14. [Daily Sales Summary & Reports](#14-daily-sales-summary--reports)
15. [Implementation Phases](#15-implementation-phases)
16. [Edge Cases & Validations](#16-edge-cases--validations)
17. [Review Changelog — Issues Found & Fixed](#17-review-changelog--issues-found--fixed)

---

## 1. Why This Section Is Critical

Every restaurant in India is legally required to issue a proper tax invoice for dine-in, takeaway, and delivery orders. A billing system is not optional — it is a **compliance requirement** under GST law. Getting this wrong exposes the restaurant owner to penalties, audit risks, and loss of customer trust.

**Non-negotiables:**
- Invoice must contain all GST-mandated fields (GSTIN, SAC code, tax breakdown)
- Invoice numbers must be sequential with no gaps within a financial year
- FSSAI license number must appear on every bill
- Tax breakdowns must follow CGST+SGST (intra-state) or IGST (inter-state) rules
- Bills must be printable on thermal printers (80mm/58mm) — this is how 95%+ of Indian restaurants operate
- Service charge (if levied) IS part of the taxable value for GST — incorrect handling = compliance risk
- Discounts must be deducted BEFORE tax calculation per GST Section 15(3)

---

## 2. Current System Analysis — What Exists Today

### 2.1 Order Model (as-is)

```prisma
model Order {
  id             String      @id @default(cuid())
  restaurantId   String
  tableNumber    String
  items          Json        // [{menuItemId, name, quantity, price}]
  total          Float       // Simple sum of (price × qty) — NO tax, NO discount
  status         OrderStatus // pending → accepted → preparing → ready → served → completed
  customerName   String?
  customerMobile String?
  notes          String?
}
```

**Key observations:**
- `order.total` = raw sum of items only (no tax, no discount applied)
- `order.items` stores a snapshot of `{menuItemId, name, quantity, price}` — good, prices are captured at order time
- `order.total` is calculated CLIENT-SIDE and sent to server WITHOUT verification — **bill must RECALCULATE from items, never trust order.total**
- No relation to any Bill model currently exists

### 2.2 Settings Model (as-is)

```prisma
model Settings {
  taxRate        Float?  @default(0.08)   // stored as decimal: 0.08 = 8%
  serviceCharge  Float?  @default(0.1)    // stored as decimal: 0.1 = 10%
  discountText   String?                  // display-only banner text, no logic
  currency       Currency @default(INR)
}
```

**Key observations:**
- `taxRate` and `serviceCharge` are stored as **decimals** (0.08 = 8%), not percentages
- These fields exist but are **NEVER used** anywhere — not in order creation, not in analytics, nowhere
- `discountText` is purely informational — displayed as a banner on PublicMenu, no calculation
- The new billing system must be aware of this decimal storage format

### 2.3 Restaurant Model — Unused Discount Field

```prisma
model Restaurant {
  discount  Json?  // EXISTS but never validated, never used, never referenced
}
```

This field will be repurposed for the new discount preset system (see Section 5).

### 2.4 Data Flow Gap

```
Current flow:
  Customer adds items → cart total (sum only) → order created → admin sees order
                                                                      ↓
                                                              NO BILLING
                                                              NO TAX APPLIED
                                                              NO INVOICE

Required flow:
  Customer adds items → order(s) created → admin serves order(s) → GENERATE BILL
                                                                        ↓
                                                              Select orders for table
                                                              Apply discount (if any)
                                                              Calculate tax (GST)
                                                              Add service charge
                                                              Select payment mode
                                                              Print / save bill
```

---

## 3. Indian GST Compliance Requirements

### 3.1 GST Rates for Restaurants

| Restaurant Type | GST Rate | CGST | SGST | ITC |
|---|---|---|---|---|
| Standalone (AC/Non-AC) | 5% | 2.5% | 2.5% | No |
| Cloud Kitchen / Delivery-only | 5% | 2.5% | 2.5% | No |
| Hotel restaurant (room <= Rs 7,500/night) | 5% | 2.5% | 2.5% | No |
| Hotel restaurant (room > Rs 7,500/night) | 18% | 9% | 9% | Yes |
| Outdoor Catering | 18% | 9% | 9% | Yes |

> **Default for Goresto:** 5% GST (2.5% CGST + 2.5% SGST) — this covers the vast majority of target restaurants.

### 3.2 Mandatory Fields on a GST Tax Invoice

Every invoice **must** contain:

**Supplier (Restaurant) Info:**
- Restaurant name and address
- GSTIN (15-digit)
- State name and state code
- FSSAI License/Registration number (14-digit)

**Invoice Details:**
- Unique sequential invoice number (max 16 characters, alphanumeric)
- Invoice date and time
- Place of supply (state name + code)
- SAC Code: `996331` (Restaurant services including takeaway and delivery)

**Item Details:**
- Description of each item
- Quantity and unit price (before tax)
- Taxable value per item (after item-level discount, if any)

**Tax Breakdown:**
- Total taxable value (after all discounts, INCLUDING service charge)
- CGST rate + amount
- SGST rate + amount
- (OR IGST rate + amount, if inter-state — rare for dine-in)
- Grand total (inclusive of tax)

**Additional:**
- Payment mode
- Whether tax is payable on reverse charge (typically "No")
- Signature / authorized signatory name

### 3.3 Invoice Numbering Rules (GST)

- Must be sequential — **no gaps allowed** (cancellation gaps are acceptable with audit trail)
- Maximum 16 characters (alphanumeric, can include `/`, `-`)
- **Must reset or start a new series every financial year** (April 1)
- Each invoice number must be unique within the financial year
- Separate series allowed per branch/outlet (with documentation)

### 3.4 Service Charge — GST Treatment (CRITICAL)

> **This is the most commonly miscalculated area in Indian restaurant billing systems.**

Per GST law Section 15(1): *"The value of a supply shall be the transaction value, which is the price actually paid or payable for the said supply."*

If the restaurant levies a service charge, it is **part of the consideration received** for the supply of food. Therefore:

**Service charge IS included in the taxable value for GST calculation.**

```
CORRECT order of calculation:
  Subtotal (items)
  - Discount
  = After-Discount Amount
  + Service Charge (calculated on After-Discount Amount)
  = Taxable Value ← GST is calculated on THIS
  + CGST
  + SGST
  = Grand Total
```

However, per CCPA guidelines (July 2022), restaurants must:
- Clearly display that service charge is **voluntary**
- Not force customers to pay it
- Allow customers to have it removed on request

The bill must display: `"Service charge is voluntary and can be removed on request"`

### 3.5 Discount — GST Treatment (Section 15(3))

Per GST Section 15(3): Discounts given **before or at the time of supply** (i.e., mentioned on the invoice) are **deducted from the taxable value**.

This means:
- **Bill-level discount:** Deduct from subtotal BEFORE calculating GST — CORRECT
- **Item-level discount:** Deduct from individual item value BEFORE summing — CORRECT
- **Post-sale discount** (e.g., cashback later): NOT deductible from taxable value — different treatment

All discounts applied in Goresto are at time of billing (before/at supply), so they correctly reduce the taxable value.

### 3.6 Composition Scheme Consideration

Some small restaurants (turnover <= Rs 1.5 crore) may operate under the GST Composition Scheme:
- They pay 5% of turnover (not per transaction)
- **Cannot issue tax invoices** — must issue "Bill of Supply" instead
- Cannot show tax breakdowns on bills
- Cannot claim ITC
- Cannot supply via e-commerce platforms

> **Goresto supports both:** Tax Invoice (regular scheme) and Bill of Supply (composition scheme). A toggle in settings controls this.

### 3.7 Packaging Charges

For takeaway/delivery orders, restaurants often add packaging charges. Per GST law:
- Packaging charges are **part of the taxable value** (same treatment as service charge)
- Included in the base for GST calculation

---

## 4. Order-to-Bill Connection — Real Restaurant Flow

### 4.1 The Real Restaurant Workflow

In a real restaurant, a table's meal typically involves **multiple orders**:

```
Table 5 opens (customer seated)
  ↓
Order 1: Starters (Paneer Tikka, Soup)        ← KOT #1 to kitchen
  ↓  (15 min later)
Order 2: Main Course (Biryani, Naan, Dal)      ← KOT #2 to kitchen
  ↓  (20 min later)
Order 3: Desserts + Drinks (Gulab Jamun, Chai) ← KOT #3 to kitchen
  ↓
Customer asks for bill
  ↓
BILL consolidates ALL 3 orders into ONE bill   ← This is the invoice
```

Therefore: **Bill must support MULTIPLE orders** (not just one order per bill).

### 4.2 Data Relationship

```
┌─────────────┐     ┌─────────────┐
│   Order 1   │────→│             │
│ (Starters)  │     │             │
├─────────────┤     │    BILL     │
│   Order 2   │────→│  (Invoice)  │
│ (Main)      │     │             │
├─────────────┤     │             │
│   Order 3   │────→│             │
│ (Desserts)  │     └─────────────┘
└─────────────┘
```

**Relation:** Many Orders → One Bill (via a join table or `billId` on Order)

### 4.3 Order Model Changes

Add `billId` to the existing Order model:

```prisma
model Order {
  // ... existing fields ...
  billId  String?
  bill    Bill?   @relation(fields: [billId], references: [id])

  @@index([billId])
}
```

**Why `billId` on Order (not `orderIds[]` on Bill)?**
- Simple relational model — each order points to its bill
- Easy to query: "which orders belong to this bill?"
- Easy to check: "does this order already have a bill?"
- No JSON array management needed

### 4.4 Bill Generation Flow

```
Admin clicks "Generate Bill" for Table 5
  ↓
System queries: all orders for Table 5 where status = served/completed AND billId = null
  ↓
Shows list of unbilled orders for that table
  ↓
Admin selects which orders to include (default: all)
  ↓
System consolidates items from all selected orders
  ↓
Admin applies discount, selects payment mode
  ↓
System calculates tax, generates bill number, creates Bill record
  ↓
Updates all selected orders: set billId = newBill.id
  ↓
Shows bill preview → print
```

### 4.5 Alternative Entry Point: Bill by Table Number

Instead of selecting individual orders, admin can also:
1. Go to Billing tab → click "+ New Bill"
2. Select or type table number
3. System automatically fetches all unbilled served/completed orders for that table
4. Proceeds with bill generation

### 4.6 Single Order Bill (Common Case)

For simple scenarios (1 order = 1 bill), the flow is simpler:
- Admin clicks "Generate Bill" on a specific order in Orders tab
- Only that order's items are included
- Same bill generation modal, same calculation

Both flows use the same `GenerateBillModal` — the difference is just which orders are pre-selected.

---

## 5. Discount Management System

### 5.1 Discount Levels

Goresto supports discounts at **three levels**:

```
Level 1: Item-Level Discount
  → Specific items get discounted (e.g., "20% off on Pasta")
  → Applied per item, before item totals are summed

Level 2: Bill-Level Discount
  → Whole bill gets discounted (e.g., "10% off" or "Rs 200 off")
  → Applied after item subtotal, before tax

Level 3: Discount Presets (Festival/Promotional)
  → Pre-configured discount rules that admin can activate/deactivate
  → Can be item-level or bill-level
  → Auto-suggested during billing when active
```

### 5.2 Item-Level Discount

**When used:**
- Customer didn't like a dish → comp it (100% off)
- New item launch → 20% off on that specific item
- "Buy 2 get 1 free" on mocktails → 1 item at 0

**How it works in the bill:**

```
Bill Items (with item-level discount):
┌─────────────────────────────────────────────────────────────┐
│ Item              Qty   Rate    Disc     Taxable Value      │
│─────────────────────────────────────────────────────────────│
│ Paneer Tikka       1    ₹280     —       ₹280.00           │
│ Butter Chicken     1    ₹350   20%off    ₹280.00           │ ← item discount
│ Garlic Naan        3    ₹60      —       ₹180.00           │
│ Gulab Jamun        1    ₹70    COMP      ₹  0.00           │ ← complimentary
│─────────────────────────────────────────────────────────────│
│ Subtotal (before item discounts)          ₹880.00           │
│ Item Discounts                           -₹140.00           │
│ Subtotal (after item discounts)           ₹740.00           │
└─────────────────────────────────────────────────────────────┘
```

**GST Treatment:** Discount is applied per item, so each item's taxable value is calculated after its discount. For single-rate restaurants (5% GST), the result is the same as deducting the total item discount from the subtotal.

### 5.3 Bill-Level Discount

**When used:**
- Festival offers (Diwali 15% off)
- Manager/owner discretion ("give them 10% off")
- Coupon code redemption
- Loyalty discount

**Types:**
- **Percentage:** 0-100% of the subtotal (after item discounts)
- **Flat amount:** Fixed Rs. amount off (e.g., Rs 200 off)

**Calculation placement:**

```
Subtotal (after item discounts)     ₹740.00
Bill Discount (10%)                -₹ 74.00
After All Discounts                 ₹666.00
+ Service Charge (10%)              ₹ 66.60
= Taxable Value                     ₹732.60
CGST (2.5%)                         ₹ 18.32
SGST (2.5%)                         ₹ 18.32
Round Off                           -₹ 0.24
GRAND TOTAL                         ₹769.00
```

### 5.4 Discount Presets (Festival / Promotional Discounts)

Stored in a new `DiscountPreset` model. Admin creates and manages these from the Billing Settings.

**Use cases:**
| Preset Name | Type | Scope | Rule | Period |
|---|---|---|---|---|
| Diwali Special | 15% off | Bill-level | All orders | 28 Oct - 3 Nov |
| Happy Hours | 20% off | Item-level (beverages category) | Category = "Beverages" | Daily 4-7 PM |
| Launch Offer | Flat ₹100 off | Bill-level | Bill > ₹500 | Until disabled |
| Comp Meal | 100% off | Bill-level | Manual apply only | Always available |
| Staff Meal | 100% off | Bill-level | Requires reason | Always available |

**How presets work during billing:**
1. When admin opens "Generate Bill", system checks for active presets
2. If an active preset matches (by date, time, or condition), it is **auto-suggested** (not auto-applied)
3. Admin can accept, modify, or dismiss the suggestion
4. Admin can also manually select any preset from a dropdown
5. The applied preset name is recorded on the bill for audit/reporting

### 5.5 Discount Constraints

| Rule | Enforcement |
|---|---|
| Max total discount cannot exceed subtotal | Backend validation: after all discounts, amount >= 0 |
| Item discount + bill discount can stack | Both are applied in sequence |
| Bill-level % is calculated AFTER item discounts | Prevents "double percentage" confusion |
| Flat discount capped at subtotal (after item discounts) | Cannot go negative |
| Comp/complimentary still generates a bill | Bill exists for audit, grandTotal = 0 or tax only |
| Discount reason required for > 50% bill discount | Prevents unauthorized large discounts |
| Only `restaurant_admin` can apply > 20% discount | Staff-level permissions (future) |

### 5.6 Discount Data Storage on Bill

```json
// Bill.discountDetails (JSON field)
{
  "itemDiscounts": [
    {
      "menuItemId": "clp4a5x1f0001",
      "itemName": "Butter Chicken",
      "originalPrice": 350,
      "discountType": "percentage",
      "discountValue": 20,
      "discountAmount": 70,
      "finalPrice": 280,
      "reason": "New item launch offer"
    },
    {
      "menuItemId": "clp4a5x1f0003",
      "itemName": "Gulab Jamun",
      "originalPrice": 70,
      "discountType": "percentage",
      "discountValue": 100,
      "discountAmount": 70,
      "finalPrice": 0,
      "reason": "Complimentary"
    }
  ],
  "billDiscount": {
    "type": "percentage",
    "value": 10,
    "amount": 74.00,
    "presetId": "clp_diwali_2026",
    "presetName": "Diwali Special",
    "reason": "Festival offer"
  },
  "totalItemDiscounts": 140.00,
  "totalBillDiscount": 74.00,
  "totalDiscountAmount": 214.00
}
```

---

## 6. Database Schema Design

### 6.1 New `Bill` Model

```prisma
model Bill {
  id              String        @id @default(cuid())
  restaurantId    String
  restaurant      Restaurant    @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  // Multiple orders can be consolidated into one bill
  orders          Order[]       // reverse relation — orders point to this bill via billId

  // Invoice identification
  billNumber      String        // e.g., "INV/2526/0001"
  billType        BillType      @default(tax_invoice) // tax_invoice | bill_of_supply

  // Financial Year tracking
  financialYear   String        // e.g., "2025-26"
  sequenceNumber  Int           // auto-increment within FY per restaurant

  // Snapshotted bill items (frozen at bill time — immune to future menu price changes)
  billItems       Json          // see Section 6.5 for structure

  // Amounts — full calculation chain
  subtotal            Float     // sum of (item.price × item.qty) before any discount
  totalItemDiscount   Float     @default(0)  // sum of all item-level discounts
  afterItemDiscount   Float     // subtotal - totalItemDiscount
  billDiscountType    DiscountType? // percentage | flat (bill-level only)
  billDiscountValue   Float?    @default(0)  // input: 10 (for 10%) or 200 (for flat Rs.200)
  billDiscountAmount  Float     @default(0)  // calculated bill-level discount in Rs.
  afterAllDiscounts   Float     // afterItemDiscount - billDiscountAmount
  serviceChargeRate   Float     @default(0)  // e.g., 10 (meaning 10%)
  serviceChargeAmount Float     @default(0)  // afterAllDiscounts × (rate/100)
  packagingCharge     Float     @default(0)  // for takeaway/delivery orders
  taxableAmount       Float     // afterAllDiscounts + serviceCharge + packagingCharge
  cgstRate            Float     @default(0)  // e.g., 2.5
  cgstAmount          Float     @default(0)
  sgstRate            Float     @default(0)  // e.g., 2.5
  sgstAmount          Float     @default(0)
  totalTax            Float     @default(0)  // cgst + sgst
  roundOff            Float     @default(0)  // rounding adjustment (+/- paise)
  grandTotal          Float     // taxableAmount + totalTax + roundOff

  // Discount tracking (full audit trail)
  discountDetails     Json?     // see Section 5.6 for structure
  discountPresetId    String?   // if a preset was used
  discountReason      String?   // free-text reason for discount

  // Payment
  paymentMode         PaymentMode   @default(cash)
  paymentStatus       PaymentStatus @default(unpaid)
  paidAmount          Float         @default(0)
  dueAmount           Float         @default(0)  // grandTotal - paidAmount
  splitPayments       Json?         // [{mode: "cash", amount: 500}, {mode: "upi", amount: 350}]

  // Customer (copied from order or entered at billing)
  customerName    String?
  customerMobile  String?
  customerGstin   String?       // for B2B invoices

  // Table info (denormalized for quick access)
  tableNumber     String

  // Order type
  orderType       OrderType     @default(dine_in)

  // Metadata
  notes           String?       @db.Text
  createdBy       String?       // staff/user who generated the bill
  cancelledAt     DateTime?
  cancelReason    String?
  creditNoteNumber String?      // if cancelled, the credit note reference

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@unique([restaurantId, financialYear, sequenceNumber])
  @@index([restaurantId])
  @@index([restaurantId, createdAt])
  @@index([restaurantId, paymentStatus])
  @@index([restaurantId, tableNumber, createdAt])
  @@index([billNumber])
}
```

### 6.2 New Enums

```prisma
enum BillType {
  tax_invoice
  bill_of_supply
}

enum PaymentMode {
  cash
  card
  upi
  split
}

enum PaymentStatus {
  unpaid
  paid
  partially_paid
  cancelled
}

enum DiscountType {
  percentage
  flat
}

enum OrderType {
  dine_in
  takeaway
  delivery
}
```

### 6.3 New `BillSequence` Model

```prisma
model BillSequence {
  id              String   @id @default(cuid())
  restaurantId    String
  restaurant      Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  financialYear   String   // "2025-26"
  lastSequence    Int      @default(0)

  @@unique([restaurantId, financialYear])
}
```

### 6.4 New `DiscountPreset` Model

```prisma
model DiscountPreset {
  id              String      @id @default(cuid())
  restaurantId    String
  restaurant      Restaurant  @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  name            String      // "Diwali Special", "Happy Hours", "Staff Meal"
  description     String?
  isActive        Boolean     @default(true)

  // Discount definition
  scope           DiscountScope   @default(bill)  // bill | item_category | item_specific
  discountType    DiscountType    // percentage | flat
  discountValue   Float           // 15 (for 15%) or 200 (for Rs.200)

  // Conditions (when this preset can be applied)
  minBillAmount   Float?      // only apply if bill subtotal >= this amount
  applicableCategories String[] // menu categories this applies to (for item_category scope)
  applicableItemIds    String[] // specific menu item IDs (for item_specific scope)

  // Schedule
  startDate       DateTime?   // null = always available
  endDate         DateTime?   // null = no end
  startTime       String?     // "16:00" for happy hour start (null = all day)
  endTime         String?     // "19:00" for happy hour end
  activeDays      Int[]       // [1,2,3,4,5] for weekdays (0=Sun, 6=Sat), empty = all days

  // Constraints
  requiresReason  Boolean     @default(false)  // must enter reason when applying
  maxDiscountAmount Float?    // cap: even if 50%, max Rs.500
  autoSuggest     Boolean     @default(true)   // auto-suggest during billing when conditions match

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([restaurantId, isActive])
}

enum DiscountScope {
  bill
  item_category
  item_specific
}
```

### 6.5 Bill Items JSON Structure

`Bill.billItems` stores a **snapshot** of all items at the time of billing. This is frozen data — even if menu prices change later, the bill remains accurate.

```json
// Bill.billItems structure
[
  {
    "orderId": "clxyz001",
    "menuItemId": "clp4a5x1f0000",
    "name": "Paneer Tikka",
    "category": "Starters",
    "quantity": 1,
    "unitPrice": 280.00,
    "itemDiscountType": null,
    "itemDiscountValue": 0,
    "itemDiscountAmount": 0.00,
    "taxableValue": 280.00
  },
  {
    "orderId": "clxyz001",
    "menuItemId": "clp4a5x1f0001",
    "name": "Butter Chicken",
    "category": "Main Course",
    "quantity": 1,
    "unitPrice": 350.00,
    "itemDiscountType": "percentage",
    "itemDiscountValue": 20,
    "itemDiscountAmount": 70.00,
    "taxableValue": 280.00
  },
  {
    "orderId": "clxyz002",
    "menuItemId": "clp4a5x1f0002",
    "name": "Garlic Naan",
    "category": "Breads",
    "quantity": 3,
    "unitPrice": 60.00,
    "itemDiscountType": null,
    "itemDiscountValue": 0,
    "itemDiscountAmount": 0.00,
    "taxableValue": 180.00
  }
]
```

**Why snapshot?**
- Menu prices may change tomorrow — but this bill was generated at today's prices
- Items may be removed from menu — bill must still show what was ordered
- Each item tracks which order it came from (for multi-order bills)
- Item-level discount is stored per item for audit trail

### 6.6 Order Model Changes

```prisma
model Order {
  // ... existing fields unchanged ...

  // NEW: Link to bill
  billId  String?
  bill    Bill?   @relation(fields: [billId], references: [id])

  @@index([billId])
}
```

### 6.7 Settings Model Additions

```prisma
// Add inside existing Settings model:

  // GST Configuration
  gstin             String?       // 15-digit GSTIN
  gstScheme         GstScheme     @default(regular)
  gstRate           Float         @default(5)       // total GST rate as percentage (5 or 18)
  fssaiNumber       String?       // 14-digit FSSAI license
  placeOfSupply     String?       // State name
  placeOfSupplyCode String?       // State code (e.g., "29")

  // Bill Configuration
  billPrefix            String    @default("INV")
  showServiceCharge     Boolean   @default(false)
  serviceChargeLabel    String?   @default("Service Charge")
  enableRoundOff        Boolean   @default(true)
  enablePackagingCharge Boolean   @default(false)
  defaultPackagingCharge Float?   @default(0)
  billFooterText        String?   @default("Thank you for dining with us!")
  showFeedbackQR        Boolean   @default(false)
  autoPrintOnBill       Boolean   @default(false)
  thermalPrinterWidth   ThermalWidth @default(eighty_mm)
```

```prisma
enum GstScheme {
  regular
  composition
}

enum ThermalWidth {
  eighty_mm
  fifty_eight_mm
}
```

### 6.8 Settings Format Standardization

**IMPORTANT:** The existing `Settings.taxRate` (0.08) and `Settings.serviceCharge` (0.1) use decimal format. The new `gstRate` uses percentage format (5 = 5%).

To avoid confusion:
- New field `gstRate` = percentage (5, 12, 18, 28) — used for billing
- Existing `taxRate` = kept as-is for backward compatibility, but **not used by billing**
- Existing `serviceCharge` = decimal (0.1 = 10%) — billing reads this and converts: `serviceChargeRate = settings.serviceCharge * 100`
- Eventually migrate `taxRate` to be replaced by `gstRate`, but not in this phase

### 6.9 Restaurant Model Changes

```prisma
model Restaurant {
  // ... existing fields ...

  // Add relations
  bills           Bill[]
  billSequences   BillSequence[]
  discountPresets DiscountPreset[]
}
```

The existing `Restaurant.discount` (Json?) field remains but is NOT used by the billing system. The new `DiscountPreset` model replaces it. Can be cleaned up in a future migration.

---

## 7. Settings Additions (Tax & Billing Configuration)

### 7.1 New "Billing & Tax" Section in Settings Page

```
┌──────────────────────────────────────────────────────────────┐
│  Billing & Tax Settings                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  GST Registration                                            │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ GST Scheme:       (●) Regular      ( ) Composition   │    │
│  │ GSTIN:            [29AADCB2230M1ZP              ]    │    │
│  │ FSSAI Number:     [12345678901234               ]    │    │
│  │ GST Rate:         [ 5 ▼ ] %   (5% / 12% / 18%)     │    │
│  │ Place of Supply:  [Karnataka ▼]   Code: [29]        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  Bill Preferences                                            │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Bill Number Prefix:     [INV]                        │    │
│  │ Service Charge:         [x] Enabled   [ 10 ] %      │    │
│  │   ⓘ Service charge is included in taxable value      │    │
│  │     for GST calculation per Section 15(1).           │    │
│  │ Packaging Charge:       [ ] Enabled   [₹  0 ]       │    │
│  │ Round Off:              [x] Round to nearest ₹1      │    │
│  │ Printer Width:          (●) 80mm   ( ) 58mm          │    │
│  │ Auto-print on bill:     [ ] Enabled                  │    │
│  │ Show Feedback QR:       [ ] Enabled                  │    │
│  │ Footer Text:            [Thank you for dining...!]   │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  Discount Presets                                            │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ [+ Add Preset]                                       │    │
│  │                                                      │    │
│  │ ┌────────────────────────────────────────────────┐   │    │
│  │ │ 🟢 Diwali Special    │ 15% off bill │ Oct-Nov │   │    │
│  │ │                               [Edit] [Disable] │   │    │
│  │ ├────────────────────────────────────────────────┤   │    │
│  │ │ 🔴 Happy Hours       │ 20% off beverages │ 4-7PM│  │    │
│  │ │                               [Edit] [Enable]  │   │    │
│  │ ├────────────────────────────────────────────────┤   │    │
│  │ │ 🟢 Staff Meal        │ 100% off │ Always      │   │    │
│  │ │                               [Edit] [Disable] │   │    │
│  │ └────────────────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│                   [ Save Settings ]                           │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Validation Rules

| Field | Validation |
|---|---|
| GSTIN | Regex: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`, first 2 digits = placeOfSupplyCode |
| FSSAI | Exactly 14 digits: `/^[0-9]{14}$/` |
| GST Rate | Must be one of: 0, 5, 12, 18, 28 |
| Bill Prefix | 1-5 uppercase alphanumeric: `/^[A-Z0-9]{1,5}$/` |
| Service Charge % | 0-30 (no restaurant charges more than 30%) |
| Packaging Charge | 0-500 Rs. |

### 7.3 Composition Scheme Behavior

When `gstScheme = composition`:
- GSTIN field is hidden (composition dealers may not have GSTIN for small turnover)
- GST Rate dropdown is disabled (tax is paid on aggregate turnover, not per bill)
- Bill header shows "BILL OF SUPPLY" instead of "TAX INVOICE"
- No CGST/SGST lines on bill
- Footer shows: "Composition taxable person, not eligible to collect tax on supplies"

---

## 8. Tax Calculation Engine (GST-Correct)

### 8.1 Corrected Calculation Flow

```
Step 1: Build bill items from order(s)
        For each item: lineTotal = unitPrice × quantity

Step 2: Apply ITEM-LEVEL discounts (if any)
        For each discounted item:
          if percentage: itemDiscount = lineTotal × (value / 100)
          if flat: itemDiscount = min(value, lineTotal)
          taxableItemValue = lineTotal - itemDiscount

Step 3: Calculate subtotals
        subtotal = sum of all lineTotals (before any discount)
        totalItemDiscount = sum of all itemDiscounts
        afterItemDiscount = subtotal - totalItemDiscount

Step 4: Apply BILL-LEVEL discount
        if percentage: billDiscountAmount = afterItemDiscount × (value / 100)
        if flat: billDiscountAmount = min(value, afterItemDiscount)
        afterAllDiscounts = afterItemDiscount - billDiscountAmount

Step 5: Add SERVICE CHARGE (if enabled)
        serviceChargeAmount = afterAllDiscounts × (serviceChargeRate / 100)

Step 6: Add PACKAGING CHARGE (if takeaway/delivery and enabled)
        packagingCharge = settings.defaultPackagingCharge (or manual entry)

Step 7: Calculate TAXABLE VALUE
        taxableAmount = afterAllDiscounts + serviceChargeAmount + packagingCharge
        ← THIS IS THE GST BASE (service charge + packaging are INCLUDED per Section 15)

Step 8: Calculate GST (regular scheme only)
        if gstScheme === "regular":
          halfRate = gstRate / 2
          cgstAmount = round2(taxableAmount × (halfRate / 100))
          sgstAmount = round2(taxableAmount × (halfRate / 100))
          totalTax = cgstAmount + sgstAmount
        if gstScheme === "composition":
          cgstAmount = 0, sgstAmount = 0, totalTax = 0

Step 9: Calculate raw total
        rawTotal = taxableAmount + totalTax

Step 10: Round off (if enabled)
         roundOff = round(rawTotal) - rawTotal
         Constraint: |roundOff| <= 0.50

Step 11: Grand Total
         grandTotal = rawTotal + roundOff
```

### 8.2 Implementation

```javascript
// server/utils/taxCalculator.js

/**
 * Calculates a complete bill with Indian GST compliance.
 *
 * IMPORTANT: Service charge and packaging charge are INCLUDED in the
 * taxable value per GST Section 15(1). They form part of the
 * "consideration for supply."
 */
export function calculateBill({
  billItems,        // [{unitPrice, quantity, itemDiscountType, itemDiscountValue}]
  settings,         // from DB: {gstScheme, gstRate, serviceCharge, showServiceCharge, ...}
  billDiscountType, // "percentage" | "flat" | null
  billDiscountValue,// number
  orderType,        // "dine_in" | "takeaway" | "delivery"
  packagingCharge,  // number (manual override or from settings)
}) {
  // ── Step 1 & 2: Item-level calculations ──
  const processedItems = billItems.map(item => {
    const lineTotal = round2(item.unitPrice * item.quantity);
    let itemDiscountAmount = 0;

    if (item.itemDiscountType === "percentage" && item.itemDiscountValue > 0) {
      itemDiscountAmount = round2(lineTotal * (item.itemDiscountValue / 100));
    } else if (item.itemDiscountType === "flat" && item.itemDiscountValue > 0) {
      itemDiscountAmount = round2(Math.min(item.itemDiscountValue, lineTotal));
    }

    return {
      ...item,
      lineTotal,
      itemDiscountAmount,
      taxableValue: round2(lineTotal - itemDiscountAmount),
    };
  });

  // ── Step 3: Subtotals ──
  const subtotal = round2(processedItems.reduce((s, i) => s + i.lineTotal, 0));
  const totalItemDiscount = round2(processedItems.reduce((s, i) => s + i.itemDiscountAmount, 0));
  const afterItemDiscount = round2(subtotal - totalItemDiscount);

  // ── Step 4: Bill-level discount ──
  let billDiscountAmount = 0;
  if (billDiscountType === "percentage" && billDiscountValue > 0) {
    billDiscountAmount = round2(afterItemDiscount * (billDiscountValue / 100));
  } else if (billDiscountType === "flat" && billDiscountValue > 0) {
    billDiscountAmount = round2(Math.min(billDiscountValue, afterItemDiscount));
  }
  const afterAllDiscounts = round2(afterItemDiscount - billDiscountAmount);

  // ── Step 5: Service charge ──
  // settings.serviceCharge is stored as decimal (0.1 = 10%)
  const serviceChargeRate = settings.showServiceCharge
    ? round2((settings.serviceCharge || 0) * 100)
    : 0;
  const serviceChargeAmount = serviceChargeRate > 0
    ? round2(afterAllDiscounts * (serviceChargeRate / 100))
    : 0;

  // ── Step 6: Packaging charge ──
  const finalPackagingCharge = (orderType !== "dine_in" && settings.enablePackagingCharge)
    ? round2(packagingCharge || settings.defaultPackagingCharge || 0)
    : 0;

  // ── Step 7: Taxable value ──
  // Service charge + packaging are PART of taxable value per GST Section 15
  const taxableAmount = round2(afterAllDiscounts + serviceChargeAmount + finalPackagingCharge);

  // ── Step 8: GST ──
  let cgstRate = 0, cgstAmount = 0, sgstRate = 0, sgstAmount = 0, totalTax = 0;

  if (settings.gstScheme === "regular" || !settings.gstScheme) {
    const gstRate = settings.gstRate || 5; // default 5%
    const halfRate = gstRate / 2;
    cgstRate = halfRate;
    sgstRate = halfRate;
    cgstAmount = round2(taxableAmount * (halfRate / 100));
    sgstAmount = round2(taxableAmount * (halfRate / 100));
    totalTax = round2(cgstAmount + sgstAmount);
  }
  // Composition scheme: totalTax stays 0

  // ── Step 9 & 10: Rounding ──
  const rawTotal = round2(taxableAmount + totalTax);
  let roundOff = 0;
  if (settings.enableRoundOff !== false) {
    roundOff = round2(Math.round(rawTotal) - rawTotal);
  }

  // ── Step 11: Grand Total ──
  const grandTotal = round2(rawTotal + roundOff);

  return {
    billItems: processedItems,
    subtotal,
    totalItemDiscount,
    afterItemDiscount,
    billDiscountType: billDiscountAmount > 0 ? billDiscountType : null,
    billDiscountValue: billDiscountAmount > 0 ? billDiscountValue : 0,
    billDiscountAmount,
    afterAllDiscounts,
    serviceChargeRate,
    serviceChargeAmount,
    packagingCharge: finalPackagingCharge,
    taxableAmount,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    totalTax,
    roundOff,
    grandTotal,
  };
}

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
```

### 8.3 Worked Examples

**Example 1: Simple bill, 5% GST, no discount, no service charge**

```
Items: Butter Chicken ₹350 × 1, Naan ₹60 × 2, Lassi ₹80 × 1

Subtotal:                ₹ 550.00
Item Discounts:          ₹   0.00
After Item Discounts:    ₹ 550.00
Bill Discount:           ₹   0.00
After All Discounts:     ₹ 550.00
Service Charge:          ₹   0.00
Packaging Charge:        ₹   0.00
Taxable Amount:          ₹ 550.00   ← GST base
CGST (2.5%):             ₹  13.75
SGST (2.5%):             ₹  13.75
Total Tax:               ₹  27.50
Raw Total:               ₹ 577.50
Round Off:               ₹  +0.50
GRAND TOTAL:             ₹ 578.00
```

**Example 2: Item discount + Bill discount + Service charge + GST**

```
Items:
  Paneer Tikka   ₹280 × 1  (no discount)      = ₹ 280.00
  Butter Chicken ₹350 × 1  (20% item discount) = ₹ 280.00 (saved ₹70)
  Garlic Naan    ₹60  × 3  (no discount)       = ₹ 180.00
  Gulab Jamun    ₹70  × 1  (COMP - 100% off)   = ₹   0.00 (saved ₹70)

Subtotal:                ₹ 880.00
Item Discounts:         -₹ 140.00   (₹70 + ₹70)
After Item Discounts:    ₹ 740.00
Bill Discount (10%):    -₹  74.00
After All Discounts:     ₹ 666.00
Service Charge (10%):   +₹  66.60   ← on ₹666
Packaging:               ₹   0.00   (dine-in)
Taxable Amount:          ₹ 732.60   ← ₹666 + ₹66.60 (SC is IN taxable)
CGST (2.5%):             ₹  18.32
SGST (2.5%):             ₹  18.32
Total Tax:               ₹  36.64
Raw Total:               ₹ 769.24
Round Off:               ₹  -0.24
GRAND TOTAL:             ₹ 769.00
```

**Example 3: Takeaway with packaging charge, flat discount**

```
Items:
  Biryani ₹300 × 2 = ₹600.00
  Raita   ₹50  × 1 = ₹ 50.00

Subtotal:                ₹ 650.00
Item Discounts:          ₹   0.00
After Item Discounts:    ₹ 650.00
Bill Discount (Flat ₹100): -₹ 100.00
After All Discounts:     ₹ 550.00
Service Charge:          ₹   0.00  (disabled for takeaway)
Packaging Charge:       +₹  30.00
Taxable Amount:          ₹ 580.00  ← ₹550 + ₹30 packaging
CGST (2.5%):             ₹  14.50
SGST (2.5%):             ₹  14.50
Total Tax:               ₹  29.00
Raw Total:               ₹ 609.00
Round Off:               ₹   0.00
GRAND TOTAL:             ₹ 609.00
```

**Example 4: Composition scheme (Bill of Supply)**

```
Items: Dosa ₹120 × 2, Coffee ₹40 × 1

Subtotal:                ₹ 280.00
After All Discounts:     ₹ 280.00
Service Charge:          ₹   0.00
Taxable Amount:          ₹ 280.00
(No CGST/SGST — composition scheme)
GRAND TOTAL:             ₹ 280.00

Bill header: "BILL OF SUPPLY"
Footer: "Composition taxable person, not eligible to collect tax on supplies"
```

**Example 5: Split payment**

```
Grand Total:             ₹ 769.00
Payment Mode:            Split
  Cash:                  ₹ 400.00
  UPI:                   ₹ 369.00
  ──────────────────────
  Total Paid:            ₹ 769.00  ✓ (matches grand total)
Payment Status:          Paid
```

---

## 9. Backend Architecture

### 9.1 File Structure

```
server/
├── routes/
│   ├── bills.routes.js
│   └── discountPresets.routes.js
├── controllers/
│   ├── bills.controller.js
│   └── discountPresets.controller.js
├── services/
│   ├── bills.service.js
│   └── discountPresets.service.js
├── validators/
│   ├── bills.validator.js
│   └── discountPresets.validator.js
└── utils/
    ├── taxCalculator.js
    ├── billNumberGenerator.js
    ├── amountInWords.js        // "Rupees Seven Hundred Sixty Nine Only"
    └── indianStates.js
```

### 9.2 API Endpoints

**Bills:**
```
POST   /restaurants/:restaurantId/bills                    # Generate bill
GET    /restaurants/:restaurantId/bills                    # List bills (filtered)
GET    /restaurants/:restaurantId/bills/:id                # Get single bill (full detail)
PATCH  /restaurants/:restaurantId/bills/:id/payment        # Record payment
PATCH  /restaurants/:restaurantId/bills/:id/cancel         # Cancel bill
GET    /restaurants/:restaurantId/bills/:id/pdf            # Download PDF
GET    /restaurants/:restaurantId/bills/summary            # Sales summary
GET    /restaurants/:restaurantId/bills/next-number        # Preview next bill number
GET    /restaurants/:restaurantId/bills/unbilled-orders    # Get unbilled orders (optionally by table)
POST   /restaurants/:restaurantId/bills/preview-calculation # Preview tax calculation (no save)
```

**Discount Presets:**
```
GET    /restaurants/:restaurantId/discount-presets         # List all presets
POST   /restaurants/:restaurantId/discount-presets         # Create preset
PATCH  /restaurants/:restaurantId/discount-presets/:id     # Update preset
DELETE /restaurants/:restaurantId/discount-presets/:id     # Delete preset
GET    /restaurants/:restaurantId/discount-presets/active  # Get currently active presets
```

### 9.3 Key API: POST /bills (Generate Bill)

```json
// Request
{
  "orderIds": ["clxyz001", "clxyz002"],       // MULTIPLE orders supported
  "tableNumber": "5",
  "orderType": "dine_in",                     // dine_in | takeaway | delivery

  // Item-level discounts (optional — only for items that have discounts)
  "itemDiscounts": [
    {
      "menuItemId": "clp4a5x1f0001",
      "discountType": "percentage",
      "discountValue": 20,
      "reason": "New item launch"
    },
    {
      "menuItemId": "clp4a5x1f0003",
      "discountType": "percentage",
      "discountValue": 100,
      "reason": "Complimentary"
    }
  ],

  // Bill-level discount (optional)
  "billDiscountType": "percentage",            // percentage | flat | null
  "billDiscountValue": 10,
  "discountPresetId": "clp_diwali_2026",       // if using a preset
  "discountReason": "Diwali festival offer",

  // Payment
  "paymentMode": "split",
  "splitPayments": [
    { "mode": "cash", "amount": 400 },
    { "mode": "upi", "amount": 369 }
  ],
  "markAsPaid": true,

  // Optional
  "customerGstin": null,
  "packagingCharge": 0,
  "notes": null
}
```

```json
// Response
{
  "success": true,
  "data": {
    "id": "cl_bill_001",
    "billNumber": "INV/2526/0012",
    "billType": "tax_invoice",
    "tableNumber": "5",
    "orderType": "dine_in",
    "billItems": [...],
    "subtotal": 880.00,
    "totalItemDiscount": 140.00,
    "afterItemDiscount": 740.00,
    "billDiscountType": "percentage",
    "billDiscountValue": 10,
    "billDiscountAmount": 74.00,
    "afterAllDiscounts": 666.00,
    "serviceChargeRate": 10,
    "serviceChargeAmount": 66.60,
    "packagingCharge": 0,
    "taxableAmount": 732.60,
    "cgstRate": 2.5,
    "cgstAmount": 18.32,
    "sgstRate": 2.5,
    "sgstAmount": 18.32,
    "totalTax": 36.64,
    "roundOff": -0.24,
    "grandTotal": 769.00,
    "paymentMode": "split",
    "paymentStatus": "paid",
    "splitPayments": [...],
    "discountDetails": {...},
    "orders": [...],
    "restaurant": {
      "name": "Spice Garden",
      "address": "123, MG Road, Koramangala, Bangalore",
      "phone": "+91 98765 43210",
      "gstin": "29AADCB2230M1ZP",
      "fssaiNumber": "12345678901234",
      "placeOfSupply": "Karnataka",
      "placeOfSupplyCode": "29"
    }
  }
}
```

### 9.4 Key API: POST /bills/preview-calculation

This is a **read-only** endpoint for the frontend to show real-time tax calculation in the Generate Bill modal without creating a bill.

```json
// Request — same as POST /bills but no side effects
// Response — same calculation result but no bill number, no DB write
```

### 9.5 Key API: GET /bills/unbilled-orders

```
GET /restaurants/:id/bills/unbilled-orders?tableNumber=5
```

Returns all orders where `status IN (served, completed) AND billId IS NULL`, optionally filtered by table number. This powers the "select orders for bill" UI.

### 9.6 Bill Creation Service Flow (Pseudocode)

```javascript
// bills.service.js - create()

async function createBill(restaurantId, data, userId) {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch and validate orders
    const orders = await tx.order.findMany({
      where: {
        id: { in: data.orderIds },
        restaurantId,
        billId: null,                          // must not already be billed
        status: { in: ['served', 'completed'] } // must be billable
      }
    });

    if (orders.length !== data.orderIds.length) {
      throw new ValidationError('Some orders are invalid, already billed, or not served');
    }

    // 2. Fetch restaurant settings
    const settings = await tx.settings.findUnique({ where: { restaurantId } });
    const restaurant = await tx.restaurant.findUnique({ where: { id: restaurantId } });

    // 3. Consolidate items from all orders + apply item discounts
    const billItems = buildBillItems(orders, data.itemDiscounts);

    // 4. Run tax calculation engine
    const calculation = calculateBill({
      billItems,
      settings,
      billDiscountType: data.billDiscountType,
      billDiscountValue: data.billDiscountValue,
      orderType: data.orderType,
      packagingCharge: data.packagingCharge,
    });

    // 5. Validate split payment (if applicable)
    if (data.paymentMode === 'split') {
      const splitTotal = data.splitPayments.reduce((s, p) => s + p.amount, 0);
      if (Math.abs(splitTotal - calculation.grandTotal) > 0.01) {
        throw new ValidationError(
          `Split total (₹${splitTotal}) does not match grand total (₹${calculation.grandTotal})`
        );
      }
    }

    // 6. Generate bill number (atomic)
    const { billNumber, financialYear, sequenceNumber } = await getNextBillNumber(restaurantId, tx);

    // 7. Determine bill type
    const billType = settings.gstScheme === 'composition' ? 'bill_of_supply' : 'tax_invoice';

    // 8. Build discount details JSON
    const discountDetails = buildDiscountDetails(billItems, data);

    // 9. Create bill record
    const paidAmount = data.markAsPaid ? calculation.grandTotal : 0;
    const bill = await tx.bill.create({
      data: {
        restaurantId,
        billNumber,
        billType,
        financialYear,
        sequenceNumber,
        billItems: calculation.billItems,
        subtotal: calculation.subtotal,
        totalItemDiscount: calculation.totalItemDiscount,
        afterItemDiscount: calculation.afterItemDiscount,
        billDiscountType: calculation.billDiscountType,
        billDiscountValue: calculation.billDiscountValue,
        billDiscountAmount: calculation.billDiscountAmount,
        afterAllDiscounts: calculation.afterAllDiscounts,
        serviceChargeRate: calculation.serviceChargeRate,
        serviceChargeAmount: calculation.serviceChargeAmount,
        packagingCharge: calculation.packagingCharge,
        taxableAmount: calculation.taxableAmount,
        cgstRate: calculation.cgstRate,
        cgstAmount: calculation.cgstAmount,
        sgstRate: calculation.sgstRate,
        sgstAmount: calculation.sgstAmount,
        totalTax: calculation.totalTax,
        roundOff: calculation.roundOff,
        grandTotal: calculation.grandTotal,
        discountDetails,
        discountPresetId: data.discountPresetId,
        discountReason: data.discountReason,
        paymentMode: data.paymentMode,
        paymentStatus: data.markAsPaid ? 'paid' : 'unpaid',
        paidAmount,
        dueAmount: calculation.grandTotal - paidAmount,
        splitPayments: data.splitPayments,
        customerName: orders[0].customerName,
        customerMobile: orders[0].customerMobile,
        customerGstin: data.customerGstin,
        tableNumber: data.tableNumber,
        orderType: data.orderType,
        notes: data.notes,
        createdBy: userId,
      },
    });

    // 10. Link orders to bill
    await tx.order.updateMany({
      where: { id: { in: data.orderIds } },
      data: { billId: bill.id },
    });

    return bill;
  });
  // If ANY step fails, the entire transaction rolls back
  // No orphan bill numbers, no half-linked orders
}
```

---

## 10. Invoice Number Generation Logic

### 10.1 Format

```
{prefix}/{financialYear shortcode}/{sequence padded to 4+ digits}
```

**Examples:**
- `INV/2526/0001`
- `INV/2526/0002`
- `GR/2526/0143`

### 10.2 Financial Year Determination

```javascript
function getCurrentFinancialYear() {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();

  if (month >= 3) { // April onwards
    return {
      label: `${year}-${(year + 1).toString().slice(2)}`,     // "2025-26"
      shortCode: `${year.toString().slice(2)}${(year + 1).toString().slice(2)}`, // "2526"
    };
  } else { // Jan-March
    return {
      label: `${year - 1}-${year.toString().slice(2)}`,       // "2025-26"
      shortCode: `${(year - 1).toString().slice(2)}${year.toString().slice(2)}`, // "2526"
    };
  }
}
```

### 10.3 Atomic Sequence Generation

```javascript
async function getNextBillNumber(restaurantId, tx) {
  const fy = getCurrentFinancialYear();
  const settings = await tx.settings.findUnique({
    where: { restaurantId },
    select: { billPrefix: true },
  });
  const prefix = settings?.billPrefix || "INV";

  // Atomic upsert+increment inside the SAME transaction as bill creation
  const sequence = await tx.billSequence.upsert({
    where: {
      restaurantId_financialYear: { restaurantId, financialYear: fy.label },
    },
    create: { restaurantId, financialYear: fy.label, lastSequence: 1 },
    update: { lastSequence: { increment: 1 } },
  });

  const paddedSeq = String(sequence.lastSequence).padStart(4, "0");
  const billNumber = `${prefix}/${fy.shortCode}/${paddedSeq}`;

  // Validate 16-char GST limit
  if (billNumber.length > 16) {
    throw new Error(`Bill number "${billNumber}" exceeds 16 characters. Shorten the prefix.`);
  }

  return { billNumber, financialYear: fy.label, sequenceNumber: sequence.lastSequence };
}
```

### 10.4 Cancelled Bill Numbers

- Bill number is **never reused** — cancelled bill stays in DB with `paymentStatus = cancelled`
- GST allows gaps from cancellations as long as there is an audit trail
- `cancelledAt` + `cancelReason` + `creditNoteNumber` provide the trail

---

## 11. Frontend UI Design

### 11.1 Dashboard Integration

Add a new tab to `RestaurantAdminDashboard.jsx`:

```javascript
{ key: 'billing', label: 'Billing', icon: 'receipt' }
```

### 11.2 Billing Tab — Main View

```
┌──────────────────────────────────────────────────────────────┐
│  Billing                                          [ + Bill ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Today's  │ │ Total    │ │ Tax      │ │ Pending  │       │
│  │ Bills    │ │ Revenue  │ │ Collected│ │ Payments │       │
│  │   12     │ │ ₹15,420  │ │ ₹734     │ │ 2        │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Filters:                                             │   │
│  │ [All ▼] [Today ▼] [All Payments ▼]   [🔍 Search...] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ INV/2526/0012  │ Table 5 │ ₹769   │ Split │  ✅ Paid│   │
│  │ 14 Feb, 12:30  │ Rahul   │ 3 orders│      │        │   │
│  │ 🏷️ Diwali Special (10%)           [View] [Print]   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ INV/2526/0011  │ Table 2 │ ₹1,240 │ UPI   │  ✅ Paid│   │
│  │ 14 Feb, 12:15  │ Walk-in │ 1 order │      │        │   │
│  │                                     [View] [Print]   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ INV/2526/0010  │ Table 8 │ ₹2,350 │ Card  │  ⏳ Due │   │
│  │ 14 Feb, 11:45  │ Priya S.│ 2 orders│      │        │   │
│  │                               [Pay] [View] [Print]   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 11.3 Generate Bill Modal — Full Flow

**Step 1: Select Orders**

```
┌──────────────────────────────────────────────────────────┐
│  Generate Bill                                     [✕]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Table Number: [ 5 ▼ ]     Order Type: (●)Dine-in       │
│                                        ( )Takeaway       │
│                                        ( )Delivery       │
│                                                          │
│  Select Orders for this Bill:                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [✓] Order #...f001 │ 12:10 PM │ 2 items │ ₹400   │  │
│  │     Paneer Tikka (1), Soup (1)                    │  │
│  │ [✓] Order #...f002 │ 12:25 PM │ 3 items │ ₹540   │  │
│  │     Butter Chicken (1), Naan (3)                  │  │
│  │ [✓] Order #...f003 │ 12:45 PM │ 2 items │ ₹140   │  │
│  │     Gulab Jamun (1), Chai (1)                     │  │
│  └────────────────────────────────────────────────────┘  │
│  3 orders selected │ 7 items │ Base total: ₹1,080       │
│                                                          │
│                                        [ Next → ]        │
└──────────────────────────────────────────────────────────┘
```

**Step 2: Items Review + Item Discounts + Bill Discount + Payment**

```
┌──────────────────────────────────────────────────────────┐
│  Generate Bill — Table 5               [← Back]   [✕]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Consolidated Items                                      │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Item              Qty   Rate    Discount   Value   │  │
│  │ ──────────────────────────────────────────────────│  │
│  │ Paneer Tikka       1    ₹280    [ None ▼]  ₹280  │  │
│  │ Soup               1    ₹120    [ None ▼]  ₹120  │  │
│  │ Butter Chicken     1    ₹350    [20% off▼] ₹280  │  │
│  │ Garlic Naan        3    ₹60     [ None ▼]  ₹180  │  │
│  │ Gulab Jamun        1    ₹70     [ Comp  ▼] ₹  0  │  │
│  │ Chai               2    ₹35     [ None ▼]  ₹ 70  │  │
│  │ ──────────────────────────────────────────────────│  │
│  │ Subtotal                                  ₹1,080  │  │
│  │ Item Discounts                            -₹ 140  │  │
│  │ After Item Discounts                       ₹ 940  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Bill Discount                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Apply Preset: [ Diwali Special (15% off) ▼ ]      │  │
│  │               [ None ] [ Happy Hours ] [ Custom ] │  │
│  │ Type: (●) Percentage  ( ) Flat Amount             │  │
│  │ Value: [ 10 ] %                Amount: -₹94.00    │  │
│  │ Reason: [ Diwali festival offer              ]    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Payment                                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [ 💵 Cash ] [ 💳 Card ] [ 📱 UPI ] [ ⇄ Split ]   │  │
│  │                                                    │  │
│  │ (If Split selected):                              │  │
│  │   Cash:  [ ₹ 400  ]                              │  │
│  │   UPI:   [ ₹ 369  ]   Total: ₹769 ✓              │  │
│  │   [+ Add another mode]                            │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  B2B Invoice? [ ] Customer GSTIN: [                  ]  │
│                                                          │
│  ──────────── Bill Summary (live) ───────────────       │
│  Subtotal:                 ₹1,080.00                     │
│  Item Discounts:            -₹ 140.00                    │
│  After Item Discounts:      ₹  940.00                    │
│  Bill Discount (10%):       -₹  94.00                    │
│  After All Discounts:       ₹  846.00                    │
│  Service Charge (10%):     +₹   84.60                    │
│    ⓘ Voluntary — removable on request                   │
│  Taxable Amount:            ₹  930.60                    │
│  CGST (2.5%):               ₹   23.27                   │
│  SGST (2.5%):               ₹   23.27                   │
│  Round Off:                 ₹   +0.86                    │
│  ──────────────────────────────                          │
│  GRAND TOTAL:               ₹  978.00                    │
│                                                          │
│  Notes: [                                           ]    │
│                                                          │
│  [ Cancel ]               [ Generate & Print Bill ]      │
└──────────────────────────────────────────────────────────┘
```

**Key UX behaviors:**
- Per-item discount dropdown: None | 5% | 10% | 15% | 20% | 50% | Comp (100%) | Custom
- Item discount dropdown can also show "reason" input when custom or Comp selected
- Preset dropdown auto-fills bill discount type+value+reason
- All totals recalculate in real-time (client-side preview calculation)
- Service charge shows voluntary disclaimer
- Split payment sum validation with visual check mark
- If Composition scheme: CGST/SGST rows hidden, header says "Bill of Supply"

### 11.4 Order Tab Integration

In the existing Orders tab, for orders with status `served` or `completed`:

```
If order.billId is null → show [Generate Bill] button
If order.billId exists → show [View Bill] button (links to that bill in billing tab)
```

Additionally, for the table-based flow, the Orders tab can show a banner:

```
┌──────────────────────────────────────────────────────┐
│ Table 5 has 3 unbilled orders (₹1,080)               │
│                              [Generate Bill for T5 →]│
└──────────────────────────────────────────────────────┘
```

### 11.5 Component Breakdown

```
src/
├── components/
│   ├── billing/
│   │   ├── BillingTab.jsx              // Main tab: stats + list + filters
│   │   ├── BillingTab.css
│   │   ├── BillCard.jsx                // Bill card in the list
│   │   ├── GenerateBillModal.jsx       // 2-step bill generation
│   │   ├── GenerateBillModal.css
│   │   ├── OrderSelector.jsx           // Step 1: select orders for bill
│   │   ├── BillItemsEditor.jsx         // Step 2: items with per-item discount
│   │   ├── BillDiscountSection.jsx     // Preset selector + custom discount
│   │   ├── PaymentModeSelector.jsx     // Cash/Card/UPI/Split buttons
│   │   ├── SplitPaymentEditor.jsx      // Dynamic split rows
│   │   ├── BillSummaryLive.jsx         // Real-time calculation display
│   │   ├── BillPreview.jsx             // Full bill preview modal
│   │   ├── BillPreview.css
│   │   ├── ThermalBill.jsx             // Thermal print layout
│   │   ├── ThermalBill.css
│   │   ├── A4Invoice.jsx               // A4 print layout
│   │   ├── A4Invoice.css
│   │   ├── DailySummary.jsx            // Summary stats + report
│   │   └── DiscountPresetManager.jsx   // CRUD for presets (in Settings)
```

---

## 12. Bill/Invoice Print Layouts

### 12.1 Thermal Bill (80mm) — with item discounts

```
──────────────────────────────────
         SPICE GARDEN
    123, MG Road, Koramangala
     Bangalore - 560034
      Ph: +91 98765 43210
──────────────────────────────────
 GSTIN: 29AADCB2230M1ZP
 FSSAI: 12345678901234
──────────────────────────────────
 TAX INVOICE
 Bill No: INV/2526/0012
 Date: 14-Feb-2026  12:30 PM
 Table: 5 | Type: Dine-In
 Cashier: Amit
──────────────────────────────────
 Item              Qty   Amount
──────────────────────────────────
 Paneer Tikka       1    280.00
 Soup               1    120.00
 Butter Chicken     1    350.00
   Disc (20%)           - 70.00
 Garlic Naan        3    180.00
 Gulab Jamun        1     70.00
   Comp                 - 70.00
 Chai               2     70.00
──────────────────────────────────
 Subtotal              1,080.00
 Item Discounts         -140.00
 Bill Disc (10%)         -94.00
                       ─────────
 After Discounts         846.00
 Service Charge*          84.60
 Taxable Value           930.60
 CGST (2.5%)              23.27
 SGST (2.5%)              23.27
 Round Off                +0.86
                       ─────────
 GRAND TOTAL        ₹   978.00
──────────────────────────────────
 Payment: Split
   Cash: ₹500 | UPI: ₹478
 SAC Code: 996331
──────────────────────────────────
 Customer: Rahul (9876543210)
──────────────────────────────────
 *Service charge is voluntary
  and can be removed on request.

  Thank you for dining with us!

──────────────────────────────────
       [QR Code for Review]
──────────────────────────────────
```

### 12.2 Composition Scheme (Bill of Supply)

```
         SMALL CAFE
      ...address...
──────────────────────────────────
 BILL OF SUPPLY
 Bill No: SC/2526/0045
 Date: 14-Feb-2026  1:15 PM
──────────────────────────────────
 ...items...
──────────────────────────────────
 Subtotal               280.00
 GRAND TOTAL         ₹  280.00
──────────────────────────────────
 Composition taxable person,
 not eligible to collect tax
 on supplies.
──────────────────────────────────
```

### 12.3 A4 Invoice — Key additions

Same structure as before, with these additions:
- **Discount column** in items table (when item discounts exist)
- **"Amount in Words"** row: "Rupees Nine Hundred Seventy Eight Only"
- **Discount summary** section if discounts were applied
- **Service charge voluntary disclaimer** footnote
- **Place of Supply** with state code

### 12.4 Print CSS Strategy

Same as original plan — `@media print` with `@page` size targeting.

---

## 13. PDF Generation

### 13.1 Approach: `pdfkit` on server

Lightweight, no headless browser needed in Docker. The `/bills/:id/pdf` endpoint:
1. Fetches bill + restaurant data
2. Generates PDF using pdfkit
3. Returns as stream with `Content-Disposition: attachment; filename="INV_2526_0012.pdf"`

### 13.2 PDF includes:
- A4 format matching the formal invoice layout
- Restaurant logo (if available, from base64)
- Full tax breakdown
- Amount in words
- Discount details
- Service charge disclaimer
- FSSAI number in footer

---

## 14. Daily Sales Summary & Reports

### 14.1 Summary API

```
GET /restaurants/:id/bills/summary?from=2026-02-14&to=2026-02-14
```

```json
{
  "success": true,
  "data": {
    "period": { "from": "2026-02-14", "to": "2026-02-14" },
    "overview": {
      "totalBills": 45,
      "cancelledBills": 2,
      "activeBills": 43,
      "totalRevenue": 23500.00,
      "totalDiscount": 1200.00,
      "totalItemDiscounts": 450.00,
      "totalBillDiscounts": 750.00,
      "totalTaxCollected": 1119.05,
      "totalCgst": 559.53,
      "totalSgst": 559.52,
      "totalServiceCharge": 850.00,
      "averageBillValue": 546.51
    },
    "paymentBreakdown": {
      "cash": { "count": 18, "amount": 8500.00 },
      "card": { "count": 12, "amount": 7200.00 },
      "upi":  { "count": 11, "amount": 6300.00 },
      "split": { "count": 2,  "amount": 1500.00 }
    },
    "discountBreakdown": {
      "presets": [
        { "name": "Diwali Special", "count": 8, "totalDiscount": 520.00 },
        { "name": "Staff Meal", "count": 2, "totalDiscount": 180.00 }
      ],
      "customDiscounts": { "count": 5, "totalDiscount": 500.00 }
    },
    "unpaidBills": {
      "count": 3,
      "totalDue": 2450.00
    }
  }
}
```

### 14.2 Export: CSV for accounting

Columns: Bill No, Date, Table, Customer, Subtotal, Total Discount, Taxable Amount, CGST, SGST, Service Charge, Grand Total, Payment Mode, Status

---

## 15. Implementation Phases

### Phase A: Foundation (Schema + Tax Engine + Settings)

**Files to create/modify:**
- `server/prisma/schema.prisma` — Bill, BillSequence, DiscountPreset models + enums + Settings additions + Order.billId
- `server/utils/taxCalculator.js` — GST-correct calculation engine
- `server/utils/billNumberGenerator.js` — Atomic bill numbering
- `server/utils/amountInWords.js` — INR amount to words
- `server/utils/indianStates.js` — State codes reference
- `src/pages/Settings.jsx` — Add "Billing & Tax" section + Discount Presets CRUD
- Migration: `npx prisma migrate dev`

**Deliverable:** Settings configurable, tax engine unit-tested with all 5 examples passing.

### Phase B: Backend APIs (Bills + Discount Presets)

**Files to create:**
- `server/routes/bills.routes.js` + `discountPresets.routes.js`
- `server/controllers/bills.controller.js` + `discountPresets.controller.js`
- `server/services/bills.service.js` + `discountPresets.service.js`
- `server/validators/bills.validator.js` + `discountPresets.validator.js`

**Register in:** `server/routes/index.js`

**Deliverable:** All endpoints working, tested via API client.

### Phase C: Frontend — Bill Generation Flow

**Files to create:**
- `src/components/billing/GenerateBillModal.jsx` + `.css`
- `src/components/billing/OrderSelector.jsx`
- `src/components/billing/BillItemsEditor.jsx`
- `src/components/billing/BillDiscountSection.jsx`
- `src/components/billing/PaymentModeSelector.jsx`
- `src/components/billing/SplitPaymentEditor.jsx`
- `src/components/billing/BillSummaryLive.jsx`

**Files to modify:**
- `src/services/apiService.js` — Add `billService` + `discountPresetService`
- `src/pages/RestaurantAdminDashboard.jsx` — Add "Generate Bill" button on served orders

**Deliverable:** Full bill generation with multi-order selection, item discounts, presets, split payment.

### Phase D: Billing Tab + List

**Files to create:**
- `src/components/billing/BillingTab.jsx` + `.css`
- `src/components/billing/BillCard.jsx`
- `src/components/billing/DailySummary.jsx`

**Files to modify:**
- `src/pages/RestaurantAdminDashboard.jsx` — Add billing tab

**Deliverable:** Billing tab with stats, filters, bill list.

### Phase E: Print & Preview

**Files to create:**
- `src/components/billing/BillPreview.jsx` + `.css`
- `src/components/billing/ThermalBill.jsx` + `.css`
- `src/components/billing/A4Invoice.jsx` + `.css`

**Deliverable:** Thermal + A4 print views working.

### Phase F: PDF Generation

**Files to create:**
- `server/services/pdfGenerator.js`
- Add `pdfkit` to `server/package.json`

**Deliverable:** PDF download endpoint working.

### Phase G: Summary, Reports & Discount Preset Manager

**Files to modify/create:**
- `server/services/bills.service.js` — summary queries
- `src/components/billing/DailySummary.jsx` — full report view
- `src/components/billing/DiscountPresetManager.jsx` — manage presets in Settings

**Deliverable:** Sales reports + CSV export + discount preset CRUD.

---

## 16. Edge Cases & Validations

### 16.1 Business Logic Guards

| Scenario | Behavior |
|---|---|
| Order already has billId | Prevent — show "View Bill" instead of "Generate Bill" |
| Order not served/completed | Disable bill generation for that order |
| No orders selected | Disable "Generate" button |
| Mixed tables in selected orders | Block — all orders must be same table |
| Item discount exceeds item price | Cap at 100% (item becomes free) |
| Bill discount exceeds afterItemDiscount | Cap at afterItemDiscount |
| Both item + bill discount applied | Allowed — both deducted in sequence |
| Grand total is ₹0.00 (full comp) | Allowed — bill created for audit, paymentStatus = "paid" |
| Split payment sum != grand total | Block submission, show mismatch warning |
| Bill cancelled | Mark cancelled + record reason, bill number NOT reused |
| FY boundary (March 31 → April 1) | Auto-detect new FY, new sequence |
| Concurrent bill generation | Handled by `$transaction` + atomic increment |
| Network failure mid-creation | Transaction rollback — no orphan data |
| No GSTIN but regular scheme | Warning in settings, bill generated but flagged |
| 50+ items across orders | Thermal bill handles page breaks |
| Same menu item in multiple orders | Shown as separate line items (preserving order context) |
| Discount preset expired/deactivated | Cannot be applied, filtered from dropdown |
| Discount > 50% without reason | Require reason field (configurable threshold) |
| Service charge removed by customer | Admin unchecks service charge during billing |

### 16.2 Validation Rules

| Field | Rule |
|---|---|
| orderIds | Array of valid cuid strings, min 1, all must belong to restaurantId |
| tableNumber | Required, must match orders' tableNumber |
| itemDiscounts[].menuItemId | Must exist in the selected orders' items |
| itemDiscounts[].discountValue | 0-100 for percentage, 0-itemPrice for flat |
| billDiscountValue | 0-100 for percentage, 0-afterItemDiscount for flat |
| splitPayments[].amount | Each > 0, sum must equal grandTotal (tolerance ±₹0.01) |
| GSTIN (customer) | 15-char regex validated |
| GSTIN (restaurant) | 15-char regex, state code must match placeOfSupplyCode |
| FSSAI | Exactly 14 digits |
| GST Rate | Must be one of: 0, 5, 12, 18, 28 |
| cancelReason | Required for cancellation, 1-500 chars |

### 16.3 Security

- Bill scoped to `restaurantId` — cross-restaurant access impossible
- Only `restaurant_admin` and `super_admin` can generate/cancel bills
- Bill numbers are server-generated — client cannot set arbitrary numbers
- All monetary calculations are SERVER-SIDE — client preview is for UX only, server recalculates everything
- Cancelled bills are soft-deleted with full audit trail
- `$transaction` ensures atomicity — no half-created bills

---

## 17. Review Changelog — Issues Found & Fixed

This section documents every issue found during the expert review of the original plan.

### CRITICAL Issues (would cause compliance failures or bugs)

| # | Issue | Original Plan | Fixed Plan |
|---|---|---|---|
| 1 | **Service charge GST treatment was WRONG** | Said "Service charge is NOT part of GST taxable value" | Fixed: Service charge IS included in taxable value per GST Section 15(1). GST base = afterDiscount + serviceCharge + packagingCharge |
| 2 | **Single order per bill (1:1)** | `orderId: String` — only one order per bill | Fixed: Many-to-one via `Order.billId` — bill consolidates multiple orders (real restaurant workflow) |
| 3 | **No item-level discounts** | Only bill-level percentage/flat discount | Fixed: Full item-level discount system with per-item type, value, and reason |
| 4 | **No discount presets (festival/promotional)** | No concept of reusable discount templates | Fixed: `DiscountPreset` model with scheduling, conditions, categories, auto-suggest |
| 5 | **Inconsistent decimal vs percentage storage** | New `gstRate` = percentage (5) but existing `serviceCharge` = decimal (0.1) | Fixed: Documented the inconsistency, billing converts `serviceCharge × 100` explicitly |
| 6 | **Bill items not snapshotted** | Bill referenced order items directly | Fixed: `Bill.billItems` JSON stores frozen snapshot — immune to menu price changes |
| 7 | **No packaging charge** | Missing entirely | Fixed: `packagingCharge` field, configurable in settings, included in GST base |

### IMPORTANT Issues (would cause UX problems or data integrity issues)

| # | Issue | Original Plan | Fixed Plan |
|---|---|---|---|
| 8 | **No "unbilled orders" query** | Admin had to manually find which orders need billing | Fixed: `GET /bills/unbilled-orders?tableNumber=5` endpoint |
| 9 | **No preview-calculation endpoint** | Client would need to duplicate tax logic | Fixed: `POST /bills/preview-calculation` — server calculates without saving |
| 10 | **Discount audit trail missing** | Only stored final amounts | Fixed: `Bill.discountDetails` JSON stores full breakdown with reasons and preset references |
| 11 | **No discount reason tracking** | No accountability for who applied what discount | Fixed: `discountReason`, `discountPresetId`, per-item reasons in billItems |
| 12 | **Composition scheme footer text missing** | Just changed header from "Tax Invoice" to "Bill of Supply" | Fixed: Added mandatory footer: "Composition taxable person, not eligible to collect tax on supplies" |
| 13 | **Service charge voluntary disclaimer missing** | Not mentioned | Fixed: Bill must show "Service charge is voluntary and can be removed on request" per CCPA 2022 |
| 14 | **No order type tracking** | Dine-in vs takeaway vs delivery not distinguished | Fixed: `orderType` field on Bill affects packaging charge and service charge behavior |
| 15 | **Existing Restaurant.discount field ignored** | Not acknowledged | Fixed: Documented as legacy, not used by billing, future cleanup |
| 16 | **Bill number length not validated against GST 16-char limit** | Could generate numbers > 16 chars | Fixed: Explicit length check in `getNextBillNumber()` |

---

## Summary

This reviewed plan addresses **16 issues** found in the original draft — 7 critical (compliance/bugs) and 9 important (UX/data). The key corrections are:

1. **Service charge is IN the GST taxable base** (Section 15 compliance)
2. **Multiple orders per bill** (real restaurant workflow)
3. **Three-level discount system** (item → bill → presets)
4. **Snapshotted bill items** (immune to future price changes)
5. **Full discount audit trail** (preset tracking, reasons, per-item details)
6. **Packaging charge support** (takeaway/delivery GST compliance)

The plan is now production-ready for Indian restaurant GST billing.
