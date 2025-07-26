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
  OrderItem

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
      OrderItem
    ]),
  ],
  exports:[TypeOrmModule]
})
export class EntityModule {}
