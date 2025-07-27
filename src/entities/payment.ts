import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Order } from "./order";

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
    @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  amount: number;

  @Column({type: 'enum', enum:PaymentStatus, default: PaymentStatus.PENDING})
  status: PaymentStatus;

  @Column({type: 'enum', enum:PaymentGateway, default: PaymentGateway.CHAPA})
  gateway: PaymentGateway;

  @Column()
  reference: string; // Unique transaction reference from gateway

  @Column({ nullable: true })
  orderId: Order['id'];

  @Column({ nullable: true })
  price: number; 

  @ManyToOne(() => User, user => user)
  user: User;

  @Column({nullable: true})
  paymentUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
