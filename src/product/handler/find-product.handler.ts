import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindProductQuery } from '../query/find-product.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@/entities';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@QueryHandler(FindProductQuery)
export class FindProductHandler implements IQueryHandler<FindProductQuery> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(query: FindProductQuery): Promise<any> {
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
        message: 'Retrieve a product by ID',
        data: product,
      };
    } catch (error) {
      logAndThrowInternalServerError(
        error,
        "FindProductHandler",
        "Product/Find",
        this.activityLogService,
        {
          productId: id,
        },
      )
    }
  }
}
