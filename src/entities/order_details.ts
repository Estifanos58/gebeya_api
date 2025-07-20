import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Payment } from "./payment";

@Entity({ name: "order_details" })
export class OrderDetails {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  @JoinColumn({ name: "payment_id" })
  payment: Payment;
}
