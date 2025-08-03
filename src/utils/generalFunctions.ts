import { CartItem } from "@/entities";
import { randomUUID } from "crypto";
export function  calculateCartTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => {
    const price = item.productSku?.price ?? 0;
    return total + item.quantity * price;
  }, 0);
}

export function generateReference () {
   const timestamp = Date.now(); // Ensures uniqueness
  const randomString = Math.random().toString(36).substring(2, 10); // Alphanumeric
  return `${timestamp}-${randomString}`; // Format: tx-<timestamp>-<random>
}
