import "server-only";
import { Resend } from "resend";
import type { Order, OrderItem } from "@/db/schema";
import {
  BRAND_NAME,
  RUO_NOTICE,
  VENMO_HANDLE,
  ZELLE_RECIPIENT,
  getSiteUrl,
  venmoPaymentLink,
} from "./constants";
import { trackingUrl } from "./carriers";
import { formatMoney } from "./format";

type OrderWithItems = Order & { items: OrderItem[] };

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const ORDER_FROM = () => process.env.EMAIL_FROM ?? "orders@example.com";
const AUTH_FROM = () => process.env.AUTH_EMAIL_FROM ?? "noreply@example.com";

async function send(opts: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set; skipped "${opts.subject}"`);
    return;
  }
  try {
    await resend.emails.send(opts);
  } catch (error) {
    console.error(`[email] failed to send "${opts.subject}"`, error);
  }
}

function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Helvetica,Arial,sans-serif;color:#232b38;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;border:1px solid #e4e8ef;overflow:hidden;">
        <tr>
          <td style="padding:28px 32px;border-bottom:1px solid #eef1f6;background:linear-gradient(135deg,#ffffff 0%,#f6f9fc 100%);">
            <div style="font-size:20px;font-weight:700;letter-spacing:0.04em;">
              <span style="color:#009d9d;">PURE</span>
              <span style="color:#ff7a00;">ENERGY</span>
              <span style="color:#7c8595;">PEPTIDES</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:22px;color:#1c2431;">${title}</h1>
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #eef1f6;background:#f8fafc;">
            <p style="margin:0;font-size:11px;line-height:1.6;color:#8b94a5;">${RUO_NOTICE}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function itemsTable(items: OrderItem[]) {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eef1f6;font-size:14px;color:#232b38;">${item.name} <span style="color:#8b94a5;">× ${item.quantity}</span></td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #eef1f6;font-size:14px;color:#232b38;">${formatMoney(item.unitPriceCents * item.quantity)}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">${rows}</table>`;
}

function totalsBlock(order: Order) {
  const line = (label: string, value: string, bold = false) => `
    <tr>
      <td style="padding:4px 0;font-size:14px;color:${bold ? "#1c2431" : "#5f6a7c"};font-weight:${bold ? "700" : "400"};">${label}</td>
      <td align="right" style="padding:4px 0;font-size:14px;color:${bold ? "#1c2431" : "#5f6a7c"};font-weight:${bold ? "700" : "400"};">${value}</td>
    </tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;">
    ${line("Subtotal", formatMoney(order.subtotalCents))}
    ${order.discountCents > 0 ? line(`Discount${order.referralCode ? ` (${order.referralCode})` : ""}`, `-${formatMoney(order.discountCents)}`) : ""}
    ${line("Shipping", formatMoney(order.shippingCents))}
    ${line("Total", formatMoney(order.totalCents), true)}
  </table>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin:8px 0 4px;padding:12px 24px;background:linear-gradient(135deg,#ff7a00,#ff9a3d);color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:600;">${label}</a>`;
}

function orderLink(order: Order) {
  return `${getSiteUrl()}/order/${order.reference}?email=${encodeURIComponent(order.email)}`;
}

export async function sendOrderConfirmation(order: OrderWithItems) {
  const body = `
    <p style="font-size:14px;line-height:1.7;color:#5f6a7c;">Thank you for your order <strong style="color:#1c2431;">${order.reference}</strong>. It is currently awaiting payment. Please send your payment using one of the options below and include your order reference in the payment note.</p>
    <div style="margin:16px 0;padding:16px 20px;background:#f2fbfb;border:1px solid #c9eeee;border-radius:12px;">
      <p style="margin:0 0 8px;font-size:14px;color:#1c2431;"><strong>Zelle:</strong> ${ZELLE_RECIPIENT}</p>
      <p style="margin:0;font-size:14px;color:#1c2431;"><strong>Venmo:</strong> @${VENMO_HANDLE.replace(/^@/, "")} — <a href="${venmoPaymentLink(order.totalCents, order.reference)}" style="color:#009d9d;">pay ${formatMoney(order.totalCents)} on Venmo</a></p>
      <p style="margin:8px 0 0;font-size:12px;color:#8b94a5;">Include <strong>${order.reference}</strong> in the payment note.</p>
    </div>
    ${itemsTable(order.items)}
    ${totalsBlock(order)}
    ${button(orderLink(order), "View your order")}
  `;
  await send({
    from: ORDER_FROM(),
    to: order.email,
    subject: `Order ${order.reference} received — payment pending`,
    html: layout("We received your order", body),
  });
}

export async function sendPaymentReceived(order: OrderWithItems) {
  const body = `
    <p style="font-size:14px;line-height:1.7;color:#5f6a7c;">Payment for order <strong style="color:#1c2431;">${order.reference}</strong> has been confirmed. Your order is now being prepared for shipment.</p>
    ${itemsTable(order.items)}
    ${totalsBlock(order)}
    ${button(orderLink(order), "View your order")}
  `;
  await send({
    from: ORDER_FROM(),
    to: order.email,
    subject: `Payment received for ${order.reference}`,
    html: layout("Payment confirmed", body),
  });
}

export async function sendOrderShipped(order: OrderWithItems) {
  const url = trackingUrl(order.carrier, order.trackingNumber);
  const body = `
    <p style="font-size:14px;line-height:1.7;color:#5f6a7c;">Order <strong style="color:#1c2431;">${order.reference}</strong> has shipped via <strong>${order.carrier ?? "carrier"}</strong>.</p>
    <p style="font-size:14px;color:#1c2431;">Tracking number: <strong>${order.trackingNumber ?? ""}</strong></p>
    ${url ? button(url, "Track your package") : ""}
    ${itemsTable(order.items)}
    ${button(orderLink(order), "View your order")}
  `;
  await send({
    from: ORDER_FROM(),
    to: order.email,
    subject: `Order ${order.reference} has shipped`,
    html: layout("Your order is on the way", body),
  });
}

export async function sendOrderCancelled(order: OrderWithItems) {
  const body = `
    <p style="font-size:14px;line-height:1.7;color:#5f6a7c;">Order <strong style="color:#1c2431;">${order.reference}</strong> has been cancelled. If you believe this was in error, please contact support.</p>
    ${itemsTable(order.items)}
  `;
  await send({
    from: ORDER_FROM(),
    to: order.email,
    subject: `Order ${order.reference} cancelled`,
    html: layout("Order cancelled", body),
  });
}

export async function sendAdminNewOrder(order: OrderWithItems) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;
  const body = `
    <p style="font-size:14px;line-height:1.7;color:#5f6a7c;">
      New order <strong style="color:#1c2431;">${order.reference}</strong> from
      <strong style="color:#1c2431;">${order.shippingAddress.fullName}</strong> (${order.email}).<br/>
      Preferred payment: <strong>${order.paymentMethod}</strong> · Total: <strong>${formatMoney(order.totalCents)}</strong>
    </p>
    ${itemsTable(order.items)}
    ${button(`${getSiteUrl()}/admin/orders`, "Open admin dashboard")}
  `;
  await send({
    from: ORDER_FROM(),
    to: adminEmail,
    subject: `New order ${order.reference} — ${formatMoney(order.totalCents)}`,
    html: layout("New order placed", body),
  });
}

export async function sendEmailVerification(email: string, token: string) {
  const link = `${getSiteUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const body = `
    <p style="font-size:14px;line-height:1.7;color:#5f6a7c;">Confirm your email address to activate your ${BRAND_NAME} account. This link expires in 24 hours.</p>
    ${button(link, "Verify email address")}
    <p style="font-size:12px;color:#8b94a5;">If the button does not work, copy this link:<br/>${link}</p>
  `;
  await send({
    from: AUTH_FROM(),
    to: email,
    subject: `Verify your ${BRAND_NAME} email`,
    html: layout("Verify your email", body),
  });
}

export async function sendPasswordReset(email: string, token: string) {
  const link = `${getSiteUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const body = `
    <p style="font-size:14px;line-height:1.7;color:#5f6a7c;">We received a request to reset your ${BRAND_NAME} password. This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    ${button(link, "Reset password")}
    <p style="font-size:12px;color:#8b94a5;">If the button does not work, copy this link:<br/>${link}</p>
  `;
  await send({
    from: AUTH_FROM(),
    to: email,
    subject: `Reset your ${BRAND_NAME} password`,
    html: layout("Reset your password", body),
  });
}
