import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { CartItem } from "./cart_item";

@Entity({ name: "cart" })
export class Cart {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @ManyToOne(() => User, (user) => user.carts)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  cartItems: CartItem[];
}
