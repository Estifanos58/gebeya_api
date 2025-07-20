import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./cart";
import { ProductSkus } from "./product_skus";

@Entity({ name: "cart_item" })
export class CartItem {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, { eager: true })
  @JoinColumn({ name: "cart_id" })
  cart: Cart;

  @ManyToOne(() => ProductSkus, (sku) => sku.cartItems, { eager: true })
  @JoinColumn({ name: "product_sku_id" })
  productSku: ProductSkus;

  @Column({ name: "quantity" })
  quantity: number;
}
