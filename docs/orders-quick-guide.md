# How to Work with Orders

A simple step-by-step guide for fulfilling customer orders in the admin dashboard.

---

## Sign in

1. Go to the website and open **Sign in** (or go to `/login`).
2. Enter your admin **Email** and **Password**.
3. Click **Sign in**.

You should land on the **Admin dashboard**. If you see the public site instead, click **Admin** in the header.

---

## Open the Orders page

Click the **Orders** tab at the top.

You’ll see four summary numbers:

- **Total orders** — all orders
- **Awaiting payment** — waiting for you to confirm payment
- **Ready to ship** — paid, waiting to be shipped
- **Confirmed revenue** — money from paid and shipped orders

Below that is the order list (newest first).

---

## How an order moves

```
Customer places order
        ↓
Awaiting payment   ← customer chose Zelle or Venmo
        ↓
You confirm payment in your bank / Venmo app
        ↓
Mark paid
        ↓
You pack and ship the order
        ↓
Mark shipped
```

Or, if the order should not go forward:

```
Awaiting payment or Paid  →  Cancel order
```

**Important:** The website does not take card payments. Customers pay by **Zelle** or **Venmo**. You confirm that money arrived, then update the order in the dashboard.

---

## Step 1 — Confirm payment (Mark paid)

Do this for every order that shows **Awaiting payment**.

1. Check your Zelle or Venmo for a payment that matches:
   - the order **total**, and
   - preferably the order **reference** (starts with `PEP-…`)
2. In **Orders**, click the order row to expand it.
3. Check the payment pill (**zelle** or **venmo**) matches where the money arrived.
4. Click **Mark paid**.

What happens next:

- Status changes to **Paid**
- The customer gets a “payment received” email
- The order shows up under **Ready to ship**

---

## Step 2 — Ship the order (Mark shipped)

Do this for every order that shows **Paid**.

1. Expand the order.
2. In the **Customer** section, note the address and whether it’s **Standard shipping** or **Overnight shipping**.
3. Pack and ship the package with your carrier.
4. Back in the order:
   - Choose the carrier: **USPS**, **UPS**, **FedEx**, or **DHL**
   - Enter the **Tracking number**
   - Click **Mark shipped**

What happens next:

- Status changes to **Shipped**
- The customer gets a shipped email with tracking

> The **Mark shipped** button stays disabled until the tracking number has at least 4 characters.

---

## Cancel an order (if needed)

You can cancel while the order is **Awaiting payment** or **Paid**. You **cannot** cancel after it is **Shipped**.

1. Expand the order.
2. Click **Cancel order**.
3. Click **Yes, cancel order** to confirm (or **Keep it** to go back).

What happens next:

- Status changes to **Cancelled**
- Stock for those products is put back
- The customer gets a cancellation email

---

## Reading an order

Click any order to expand it.

**Top of the row**

- Order reference (e.g. `PEP-…`)
- Customer name
- Date
- Payment method (zelle / venmo)
- Status
- Total

**Items**

- What they ordered and quantities
- Subtotal, any discount, shipping, and total

**Customer**

- Name, email, phone
- Shipping address
- Standard or Overnight shipping

If it’s already shipped, you’ll also see the carrier and tracking number.

---

## Daily routine

1. Open **Orders**.
2. Clear **Awaiting payment** — confirm real payments, then **Mark paid**.
3. Clear **Ready to ship** — pack, ship, then **Mark shipped** with tracking.
4. Cancel only when payment never arrives or the order shouldn’t proceed.

---

## Quick answers

| Question | Answer |
| --- | --- |
| Where do I work with orders? | Admin → **Orders** |
| How do customers pay? | Zelle or Venmo (manual — you confirm outside the site) |
| When do I click Mark paid? | After you see the payment in Zelle/Venmo |
| When do I click Mark shipped? | After the package is actually shipped, with tracking |
| Can I cancel a shipped order? | No — not in the dashboard |
| Does the customer get emails? | Yes — when paid, shipped, or cancelled |

---

## If something looks wrong

- **Can’t find an order** — Use your browser’s Find (`Cmd + F` or `Ctrl + F`) and search for the customer name or `PEP-` reference.
- **Customer says they paid, but it’s still Awaiting payment** — Find the payment, then click **Mark paid**.
- **Mark shipped won’t click** — Enter a longer tracking number (at least 4 characters).
- **Customer didn’t get an email** — Ask them to check spam. Confirm the email address on the order looks correct. If emails still don’t send, contact whoever manages the website.
- **Wrong amount** — If a discount code was used, the customer owes the **Total** shown on the order (not the pre-discount price).
