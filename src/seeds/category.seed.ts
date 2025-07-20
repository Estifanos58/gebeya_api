// src/seeds/category.seed.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/categories';

@Injectable()
export class CategorySeeder {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  async seed() {
    const categories = [
      { name: 'Electronics', description: 'Phones, laptops, and more' },
      { name: 'Clothing', description: 'Men and women clothing' },
      { name: 'Home', description: 'Furniture, appliances' },
    ];
    await this.repo.save(categories);
  }
}
