import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Cart,
  CartItem,
  Category,
  Product,
  ProductSkus,
  User,
  Payment,
  Credentials,
  Store,
  Comment,
  Order,
  OrderItem,
  ActivityLog
} from './index';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      Category,
      Product,
      ProductSkus,
      User,
      Payment,
      Credentials,
      Store,
      Comment,
      Order,
      OrderItem,
      ActivityLog
    ]),
  ],
  exports:[TypeOrmModule]
})
export class EntityModule {}
