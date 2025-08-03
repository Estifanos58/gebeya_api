import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Order } from "./order";
import { Store } from "./store";

export enum PaymentStatus {
    PENDING="pending",
    SUCCESS="success",
    FAILED="failed",
    TIMEOUT="timeout"
}

export enum PaymentGateway {
  CHAPA="chapa",
  STRIPE="stripe",
  FLUTTERWAVE="fluterwave"
}

@Entity({ name: "payment" })
export class Payment {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'decimal', name: "amount" })
  amount: number;

  @Column({type: 'enum', enum:PaymentStatus, default: PaymentStatus.PENDING})
  status: PaymentStatus;

  @Column({type: 'enum', enum:PaymentGateway, default: PaymentGateway.CHAPA})
  gateway: PaymentGateway;

  @Column({name: "reference", unique: true})
  reference: string; // Unique transaction reference from gateway


  @ManyToOne(() => User, user => user.payments)
  user: User;

  @Column({name:"paymet_url" , nullable: true})
  paymentUrl: string;

  @Column({ name: "currency", default: 'ETB' })
  currency: string; // Default to 'ETB' (Ethiopian Birr)

  @OneToOne(() => Order, order => order.payment)
  @JoinColumn({ name: "order_id" }) // This side owns the FK
  order: Order;

  @ManyToOne(()=> Store, store => store.payments)
  store: Store;

  @CreateDateColumn()
  createdAt: Date;
}
