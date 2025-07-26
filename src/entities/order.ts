import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './user';
import { OrderItem } from './oder_item';

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

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  items: OrderItem[];
}