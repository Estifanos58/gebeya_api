import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindProductQuery } from '../query/find-product.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@/entities';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

@QueryHandler(FindProductQuery)
export class FindProductHandler implements IQueryHandler<FindProductQuery> {
  constructor(
    // Inject necessary services here, e.g., product repository
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async execute(query: FindProductQuery): Promise<any> {
    // Implement the logic to find a product by its ID
    const { id } = query;

    try {
      const product = await this.productRepo.findOneOrFail({
        where: { id },
        relations: ['skus', 'category', 'comment', 'store'],
      });

      if (!product)
        throw new HttpException(
          `Product with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );

      return {
        message: 'Product found successfully',
        data: product,
      };
    } catch (error) {
      throw new HttpException(
        `Product with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Example: return await this.productRepository.findById(id);
    //
  }
}
