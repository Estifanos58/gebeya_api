import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product";
import { CartItem } from "./cart_item";

export enum Size{
    LARGE = "lg",
    SMALL = "sm",
    VERY_LARGE= "vlg",
    VERY_SMALL= "vsm"
}

@Entity({ name: "product_skus" })
export class ProductSkus {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @ManyToOne(() => Product, (product) => product.skus)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @OneToMany(() => CartItem, (item) => item.productSku)
  cartItems: CartItem[];

  @Column({ name: "size", type: "enum", enum: Size })
  size: Size;

  @Column({name: "price"})
  price: number;

  @Column({name: "quantity"})
  quantity: number;

  @Column({name: "color"})
  color: string;

  @Column({ name: "prev_price", nullable: true })
  prevPrice: number;
}
