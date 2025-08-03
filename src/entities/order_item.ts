import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order";
import { ProductSkus } from "./product_skus";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => ProductSkus, product => product.id)
  productSkus: ProductSkus;

  @Column('int')
  quantity: number;

  @Column('decimal')
  price: number;
}