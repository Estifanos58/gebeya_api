import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, OneToOne } from 'typeorm';
import { User } from './user';
import { OrderItem } from './order_item';
import { Payment } from './payment';

export enum OrderStatus{
    PLACED = 'placed',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    RETURNED = 'returned'
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.orders)
  user: User;

  @Column({name: 'order_status', type:'enum', enum: OrderStatus, default: OrderStatus.PLACED})
  status: OrderStatus; // 'placed', 'shipped', 'delivered', 'cancelled', 'returned'

  @Column('decimal', {name: 'order_total_price'})
  total: number;

  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @Column({ name: 'delivery_address', nullable: true })
  deliveryAddress: string;

  @Column({ name: 'contact_info', nullable: true })
  contactInfo: string;

  @Column({ name: 'is_paid', default: false })
  isPaid: boolean;

  @OneToOne(() => Payment, payment => payment.order, { nullable: true })
  payment: Payment;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  items: OrderItem[];
}