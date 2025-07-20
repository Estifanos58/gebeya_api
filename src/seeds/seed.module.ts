import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../entities/categories';
import { Product } from '../entities/product';
import { ProductSkus } from '../entities/product_skus';
import { User } from '../entities/user';
import { Credentials } from '../entities/credentials';
import { Cart } from '../entities/cart';
import { CartItem } from '../entities/cart_item';
import { CategorySeeder } from './category.seed';
import { ProductSeeder } from './product.seed';
import { UserSeeder } from './user.seed';
import { OrderDetails, Payment } from '@/entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'estif',
          password: 'mypassword',
          database: 'gebeya',
          entities: [
            User,
            CartItem,
            Cart,
            OrderDetails,
            Payment,
            Product,
            ProductSkus,
            Category,
            Credentials
          ], // This is imported for the synchrozation
          synchronize: true,
        }),
    TypeOrmModule.forFeature([Category, Product, ProductSkus, User, Credentials, Cart, CartItem]),
  ],
  providers: [CategorySeeder, ProductSeeder, UserSeeder],
})
export class SeedModule {
  constructor(
    private readonly categorySeeder: CategorySeeder,
    private readonly productSeeder: ProductSeeder,
    private readonly userSeeder: UserSeeder,
  ) {
    this.seed();
  }

  async seed() {
    await this.categorySeeder.seed();
    await this.productSeeder.seed();
    await this.userSeeder.seed();
    console.log('✅ Seeding completed!');
  }
}
