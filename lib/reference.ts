import { ORDER_PREFIX } from "./constants";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderReference() {
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const byte of bytes) {
    out += CHARS[byte % CHARS.length];
  }
  return `${ORDER_PREFIX}-${out}`;
}
