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
  OrderDetails,
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
      OrderDetails,
    ]),
  ],
  exports:[TypeOrmModule]
})
export class EntityModule {}
