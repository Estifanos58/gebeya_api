import { CartItem } from "@/entities";

export function  calculateCartTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => {
    const price = item.productSku?.price ?? 0;
    return total + item.quantity * price;
  }, 0);
}
