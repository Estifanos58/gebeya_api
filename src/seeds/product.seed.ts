// src/seeds/product.seed.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product';
import { Category } from '../entities/categories';
import { ProductSkus, Size } from '../entities/product_skus';

@Injectable()
export class ProductSeeder {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(ProductSkus) private skuRepo: Repository<ProductSkus>,
  ) {}

  async seed() {
    const category = await this.categoryRepo.findOne({ where: { name: 'Electronics' } });

    const product = this.productRepo.create({
        name: "Samsung Galaxy S23",
        description: "Latest Samsung smartphone with advanced features",
        cover: "https://cdn.com/samsung-galaxy-s23.jpg",
        category: category![0],
    })
    // const product = this.productRepo.create({
    //   name: 'iPhone 15',
    //   description: 'Latest Apple smartphone',
    //   cover: 'https://cdn.com/iphone15.jpg',
    //   category,
    // });

    const saved = await this.productRepo.save(product);

    await this.skuRepo.save([
      {
        product: saved,
        size: Size.LARGE,
        price: '1299',
        prevPrice: 1499,
        quantity: 10,
      },
      {
        product: saved,
        size: Size.SMALL,
        price: '1199',
        prevPrice: 1299,
        quantity: 5,
      },
    ]);
  }
}
