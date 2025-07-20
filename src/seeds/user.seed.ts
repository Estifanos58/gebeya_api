// src/seeds/user.seed.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user';
import { Credentials } from '../entities/credentials';
import { Cart } from '../entities/cart';
import { CartItem } from '../entities/cart_item';
import { ProductSkus, Size } from '../entities/product_skus';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Credentials) private credentialsRepo: Repository<Credentials>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
    @InjectRepository(ProductSkus) private skuRepo: Repository<ProductSkus>,
  ) {}

  async seed() {
    const user = this.userRepo.create({
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
      isActive: true,
    });
    const savedUser = await this.userRepo.save(user);

    await this.credentialsRepo.save({
      user: savedUser,
      password: 'hashed_password_123',
    });

    const cart = await this.cartRepo.save({ user: savedUser });

    const sku = await this.skuRepo.findOne({ where: { size: Size.LARGE } });

    await this.cartItemRepo.save({
      cart: cart![0],
      productSku: sku!,
      quantity: 2,
    });
  }
}
