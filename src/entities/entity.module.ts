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
  Credentials,
  Store

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
      Credentials,
      Store
    ]),
  ],
  exports:[TypeOrmModule]
})
export class EntityModule {}
