# Admin Dashboard Tutorial

A practical guide for operating the Pure Energy Peptides admin dashboard: signing in, fulfilling customer orders, managing inventory, running referral codes, and reading analytics.

All products sold on the site are **For Research Use Only** — not for human or veterinary use. That acknowledgement is required at checkout; admins do not need to re-confirm it when fulfilling orders.

---

## Table of contents

1. [Getting access](#1-getting-access)
2. [Dashboard overview](#2-dashboard-overview)
3. [How orders work (end-to-end)](#3-how-orders-work-end-to-end)
4. [Working with customer orders](#4-working-with-customer-orders)
5. [Managing inventory](#5-managing-inventory)
6. [Referral partners and discount codes](#6-referral-partners-and-discount-codes)
7. [Analytics](#7-analytics)
8. [Emails and notifications](#8-emails-and-notifications)
9. [Customer-facing tools you should know](#9-customer-facing-tools-you-should-know)
10. [Quick reference](#10-quick-reference)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Getting access

### Who can use the admin dashboard?

Only accounts with the **admin** role can open `/admin`. Customer accounts are redirected away if they try.

### Sign in

1. Go to **`/login`** (or open the site and use **Sign in**).
2. Enter your **Email** and **Password**.
3. Click **Sign in**.

After a successful login, admin accounts land on the admin dashboard. An **Admin** link also appears in the site header for admins.

Your email must be **verified** before you can sign in. The seeded admin account is created as already verified.





## 2. Dashboard overview

Open **`/admin`**. You are redirected to **Orders**. The header shows:

- **Admin dashboard**
- **Signed in as** your email
- **Back to site** → returns to the public storefront

### Tabs

| Tab | URL | Purpose |
| --- | --- | --- |
| **Orders** | `/admin/orders` | View and fulfill customer orders |
| **Inventory** | `/admin/inventory` | Update price, stock, Active, Featured |
| **Referrals** | `/admin/referrals` | Partners and discount codes |
| **Analytics** | `/admin/analytics` | Revenue and performance |

 Customer details appear on each order. Discounts are handled through **Referrals**.

---

## 3. How orders work (end-to-end)

Understanding this flow makes the Orders tab much clearer.

```text
Customer places order
        ↓
  pending_payment   ← inventory already reserved
        ↓
  [You confirm Zelle/Venmo offline]
        ↓
  Mark paid  →  paid
        ↓
  [You ship the package]
        ↓
  Mark shipped  →  shipped  (+ tracking email)
```

Or, if payment never arrives / order should not proceed:

```text
pending_payment or paid  →  Cancel order  →  cancelled  (+ stock restored)
```

### Payment is manual

Checkout lets the customer choose **Zelle** or **Venmo**. The site does **not** charge cards or capture payments automatically.

Your job:

1. Watch for incoming Zelle/Venmo payments that match the order **reference** (e.g. `PEP-…`) and amount.
2. In admin, open the order and click **Mark paid**.

Payment details shown to customers come from:

- `NEXT_PUBLIC_ZELLE_RECIPIENT`
- `NEXT_PUBLIC_VENMO_HANDLE`

Those are environment variables, not editable in the dashboard.

### Inventory is reserved at checkout

When a customer places an order, stock is reduced immediately — even while the order is still **Awaiting payment**.

| Action | Effect on stock |
| --- | --- |
| Customer checks out | Decreases |
| **Mark paid** | No change |
| **Mark shipped** | No change |
| **Cancel order** | Restocks |

### Order statuses

| Status (badge) | Meaning |
| --- | --- |
| **Awaiting payment** | Order placed; waiting for your payment confirmation |
| **Paid** | Payment confirmed; ready to pack and ship |
| **Shipped** | Shipped; tracking recorded |
| **Cancelled** | Cancelled; inventory restored |

### Shipping options customers can choose

| Method | Price |
| --- | --- |
| Standard shipping | $15.00 |
| Overnight shipping | $50.00 |

The chosen method appears in the order’s **Customer** section.

### Confirmed revenue

**Confirmed revenue** (Orders tab and Analytics) counts only **Paid** and **Shipped** orders. Awaiting payment and cancelled orders are excluded.

---

## 4. Working with customer orders

Go to **Orders** (`/admin/orders`).

### Summary cards

| Card | What it shows |
| --- | --- |
| **Total orders** | All orders in the system |
| **Awaiting payment** | Orders still waiting for payment confirmation |
| **Ready to ship** | Orders marked **Paid** (not yet shipped) |
| **Confirmed revenue** | Sum of Paid + Shipped totals |

### Reading the order list

Orders are listed **newest first**. Each collapsed row shows:

- Order **reference** (e.g. `PEP-…`)
- Customer **full name**
- Date/time placed
- Payment preference pill: **zelle** or **venmo**
- Status badge
- Order total

Click a row to expand it.

If there are no orders yet, you will see **No orders yet.**

> There is no search, filter, or pagination UI. Scan the list by reference, name, or status. Use your browser’s find (`Cmd/Ctrl + F`) if the list is long.

### Expanded order details

**Items**

- Line items: product name × quantity and line total
- **Subtotal**
- **Discount** (if a referral code was used — shows amount and code)
- **Shipping**
- **Total**

**Customer**

- Full name, email, phone (if provided)
- Full shipping address
- **Standard shipping** or **Overnight shipping**

If already shipped, a banner shows:

`Shipped via {carrier} — {trackingNumber}`

### Daily fulfillment workflow

#### A. Confirm payment → Mark paid

1. Match the payment in Zelle or Venmo to the order (reference + amount + method).
2. Open **Orders**, expand the matching order (status **Awaiting payment**).
3. Click **Mark paid**.

What happens:

- Status becomes **Paid**
- Customer receives a **Payment received** email
- Order moves into **Ready to ship**

#### B. Ship the order → Mark shipped

1. Expand an order with status **Paid**.
2. Choose a carrier: **USPS**, **UPS**, **FedEx**, or **DHL** (default is USPS).
3. Enter the **Tracking number** (at least 4 characters).
4. Click **Mark shipped**.

What happens:

- Status becomes **Shipped**
- Carrier and tracking are saved on the order
- Customer receives a shipped email with a tracking link (when the carrier is supported)

#### C. Cancel an order

Available while status is **Awaiting payment** or **Paid** (not after **Shipped**).

1. Expand the order.
2. Click **Cancel order**.
3. Confirm with **Yes, cancel order** (or **Keep it** to abort).

What happens:

- Status becomes **Cancelled**
- Inventory for the line items is **restocked**
- Customer receives a cancellation email

You cannot cancel a shipped order from the dashboard. There is no built-in refund, return, or “unship” flow — handle those cases offline if needed.

### Practical tips

- Treat **Awaiting payment** as your payment queue and **Ready to ship** as your fulfillment queue.
- Always verify the payment method pill (**zelle** / **venmo**) against the account that received funds.
- If a referral discount was applied, the discounted total is what the customer owes — confirm against that amount.
- Double-check **Overnight** vs **Standard** before packing so you use the correct service level.

---

## 5. Managing inventory

Go to **Inventory** (`/admin/inventory`).

### Summary cards

| Card | Meaning |
| --- | --- |
| **Products** | Number of product rows |
| **Units in stock** | Sum of all quantities |
| **Low stock** | Products with **5 or fewer** units |
| **Out of stock** | Products with **0** units |

### Editing a product

Section title: **Product inventory**
Subtitle: *Update price, stock, visibility, and featured status for each product.*

Each product row shows category, stock tone (**Out of stock** / **Low stock** / **in stock**), name, and short description.

Editable fields:

| Field | Purpose |
| --- | --- |
| **Price** | Selling price in dollars |
| **Quantity** | Units available |
| **Active** | Unchecked = hidden from purchase / not orderable |
| **Featured** | Highlights the product on the storefront where featured products appear |

Click **Save**. The button briefly shows **Saving…** then **Saved**.

Validation messages you may see:

- **Enter a valid price.**
- **Enter a valid inventory count.**

### Important inventory notes

- The admin list shows **each database product row** separately. Variants such as different strengths (e.g. 50mg vs 100mg) are separate rows — update each one.
- You **cannot** create, delete, or rename products, or edit descriptions/images, from this screen. Catalog structure comes from the database / seed.
- Unchecking **Active** prevents new orders for that product; existing open orders are unaffected.
- Because checkout reserves stock immediately, keep **Quantity** accurate so customers are not sold items you cannot fulfill.

---

## 6. Referral partners and discount codes

Go to **Referrals** (`/admin/referrals`). This is the discount system (there is no separate Coupons page).

### Summary cards

| Card | Meaning |
| --- | --- |
| **Partners** | Referral partners |
| **Active codes** | Codes currently active |
| **Referred orders** | Confirmed (Paid + Shipped) orders that used a code |
| **Referred revenue** | Revenue from those confirmed referred orders |

### Create a partner

Under **New referral partner**:

1. Enter **Partner name** (required).
2. Optionally add **Email** and **Notes**.
3. Click **Add partner**.

Partners can be toggled **Active** / inactive. Inactive partners’ codes cannot be used at checkout.

### Create a discount code

Expand a partner, then under **New code**:

1. Enter a code (placeholder example: **CODE10**) — letters, numbers, and dashes only; must be unique.
2. Choose **% off** or **$ off**.
3. Enter the discount value (percent: 1–100).
4. Optionally set **Min order $**.
5. Click **Create code**.

Each code shows usage stats: orders, revenue, discounts given, and an **Active** checkbox.

For a code to work at checkout, **both** the partner and the code must be **Active**.

### Referral stats gotcha

- Dashboard “confirmed” referral stats count only **Paid** and **Shipped** orders.
- A code’s raw use count can increase when an order is placed, even if that order is later never paid or is cancelled.

---

## 7. Analytics

Go to **Analytics** (`/admin/analytics`).

### Date range

Use the pills: **7 days** | **30 days** | **90 days** (default **30 days**).

### Top stats

| Stat | Meaning |
| --- | --- |
| **Revenue** | Confirmed (Paid + Shipped) revenue in range |
| **Confirmed orders** | Count of Paid + Shipped in range |
| **Average order value** | Revenue ÷ confirmed orders |
| **Units sold** | Units from confirmed orders |

### Sections

- **Daily revenue** — bar chart over the selected range
- **Top products by revenue** — top performers
- **Orders by status** — Awaiting payment / Paid / Shipped / Cancelled
- **Payments & referrals** — Zelle/Venmo preference mix, referred orders, discounts given

Use Analytics for trends; use **Orders** for day-to-day fulfillment.

---

## 8. Emails and notifications

Transactional email is sent via Resend when `RESEND_API_KEY` is configured. Without it, order status still updates in the dashboard, but emails are skipped (and a warning is logged server-side).

### Emails customers receive

| Event | Typical email |
| --- | --- |
| Order placed | Order confirmation + how to pay (Zelle/Venmo + reference) |
| **Mark paid** | Payment received for `{reference}` |
| **Mark shipped** | Order `{reference}` has shipped (with tracking when available) |
| **Cancel order** | Order cancelled notice |

### Admin notification

If `ADMIN_NOTIFICATION_EMAIL` is set, you can receive a new-order notification with a link toward **`/admin/orders`**.

Related env vars (not editable in the UI):

| Variable | Role |
| --- | --- |
| `RESEND_API_KEY` | Enables sending |
| `EMAIL_FROM` / `AUTH_EMAIL_FROM` | From addresses |
| `ADMIN_NOTIFICATION_EMAIL` | New-order alerts |
| `NEXT_PUBLIC_ZELLE_RECIPIENT` | Zelle payee shown to customers |
| `NEXT_PUBLIC_VENMO_HANDLE` | Venmo handle shown to customers |

---

## 9. Customer-facing tools you should know

Admins are redirected from `/account` to `/admin`, but customers use these pages — useful when supporting someone who emails you.

| Page | Who uses it | Purpose |
| --- | --- | --- |
| `/account` | Signed-in customers | Their order history |
| `/track` and `/order/[reference]` | Guests (and support) | Look up an order with reference + email |
| `/checkout` | Anyone buying | Cart → shipping → Zelle/Venmo preference → place order |

When a customer asks “Where is my order?”, ask for their **reference** (`PEP-…`) and check **Orders** in admin, or have them use **Track** with the email on the order.

---

## 10. Quick reference

### Order actions by status

| Status | Available actions |
| --- | --- |
| **Awaiting payment** | **Mark paid**, **Cancel order** |
| **Paid** | **Mark shipped** (carrier + tracking), **Cancel order** |
| **Shipped** | View only (carrier/tracking banner) |
| **Cancelled** | View only |

### Carriers for Mark shipped

USPS · UPS · FedEx · DHL

### Must-know rules

1. Confirm money **outside** the app, then **Mark paid**.
2. Stock decreases at **checkout**, not at Mark paid.
3. **Cancel** restocks; **Shipped** cannot be cancelled in-app.
4. **Confirmed revenue** = Paid + Shipped only.
5. Inactive products cannot be ordered; Featured only affects merchandising.
6. Low stock threshold = **5 or fewer** units.
7. No customer list, refunds, packing-slip print, or order-notes editor in admin today.

---

## 11. Troubleshooting

| Problem | What to check |
| --- | --- |
| Cannot open `/admin` | Signed in? Role is admin? Email verified? Try `/login` again. |
| Customer says they paid but order still Awaiting payment | Match reference/amount in Zelle/Venmo, then **Mark paid**. |
| Mark shipped button disabled | Tracking number must be at least **4** characters. |
| Customer never got an email | Is `RESEND_API_KEY` set in the environment? Check spam; confirm the email on the order. |
| Stock looks wrong after a cancel | Cancel should restock once. If stock was edited manually afterward, reconcile Quantity on **Inventory**. |
| Referral code rejected at checkout | Partner **Active**? Code **Active**? Min order met? Code format valid? |
| Product not on the store / not buyable | Is **Active** checked? Is **Quantity** greater than 0? |
| Need another admin user | No UI — set `role` to `admin` (and verify email) in the database, or re-seed with `SEED_ADMIN_*`. |
| Payment details wrong on emails/checkout | Update `NEXT_PUBLIC_ZELLE_RECIPIENT` / `NEXT_PUBLIC_VENMO_HANDLE` and redeploy. |

---

## Suggested daily checklist

1. Open **Orders** → clear **Awaiting payment** by confirming real Zelle/Venmo deposits → **Mark paid**.
2. Clear **Ready to ship** → pack → enter carrier + tracking → **Mark shipped**.
3. Glance at **Inventory** for **Low stock** / **Out of stock**.
4. Check **Analytics** periodically (30-day view) for revenue and status mix.
5. Manage **Referrals** when onboarding a new partner or rotating codes.

---

