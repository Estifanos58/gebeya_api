import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./cart";
import { Credentials } from "./credentials";
import { Comment } from "./comment";
import { Store } from "./store";
import { Order } from "./order";

export enum UserRole {
    ADMIN = "admin",
    CUSTOMER = "customer",
    MERCHANT = "merchant",
    DELIVERY = "delivery"
}

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: "first_name" })
  firstName: string;

  @Column({ name: "last_name" })
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "enum", enum: UserRole })
  role: UserRole;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ type: "int", nullable: true })
  age: number;

  @Column({ default: false })
  isEmailVerified: boolean;

  @OneToMany(() => Cart, (cart) => cart.user, {cascade: true})
  carts: Cart[];

  @OneToOne(() => Credentials, (credentials) => credentials.user, {onDelete: "CASCADE", cascade: true})
  @JoinColumn({ name: "credentials_id" })
  credentials: Credentials;

  @OneToMany(()=> Comment, (comment)=> comment.user)
  comment: Comment[];

  @OneToOne(()=>Store , (store)=> store.user, {cascade: true})
  @JoinColumn({ name: "store_id" })
  store: Store;

  @OneToMany(()=>Order, (order)=>order.user)
  @JoinColumn({name : "order_id"})
  orders: Order[];
}

