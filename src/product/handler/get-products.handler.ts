import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductsQuery, ProductSortBy } from '../query/get-products.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment, Product } from '@/entities';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';


@QueryHandler(GetProductsQuery)
export class GetProductsHandler implements IQueryHandler<GetProductsQuery> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(query: GetProductsQuery): Promise<any> {
    const {
      storeId,
      categoryId,
      sortBy,
      sortOrder,
      page,
      limit,
      name,
      minRange,
      maxRange,
    } = query;

    const pageNumber = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 10;
    const skip = (pageNumber - 1) * pageSize;

    try {
      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.skus', 'skus')
        .leftJoinAndSelect('product.store', 'store')
        .leftJoinAndSelect('product.comment', 'comment');

      if (storeId) {
        queryBuilder.andWhere('store.id = :storeId', { storeId });
      }

      if (categoryId) {
        queryBuilder.andWhere('category.id = :categoryId', { categoryId });
      }

      if (name) {
        queryBuilder.andWhere('product.name ILIKE :name', {
          name: `%${name}%`,
        });
      }

      if (minRange && maxRange) {
        queryBuilder.andWhere('skus.price BETWEEN :minRange AND :maxRange', {
          minRange,
          maxRange,
        });
      }

      const totalCount = await queryBuilder.getCount();

      const products = await queryBuilder
        .orderBy(
          `product.${sortBy}`,
          sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        )
        .skip(skip)
        .take(pageSize)
        .getMany();

      if (!products || products.length === 0) {
        throw new HttpException(
          { message: 'No products found' },
          HttpStatus.NOT_FOUND,
        );
      }

      function calculateRating(comments: Comment[]): number {
        if (!comments || comments.length === 0) return 0;
        const totalRating = comments.reduce(
          (acc, comment) => acc + (comment.review || 0),
          0,
        );
        const totalShouldBe = comments.length * 5; // Assuming max rating is 5
        return (totalRating / totalShouldBe) * 5; // Normalize to a scale
      }

      if (sortBy === ProductSortBy.RATING) {
        products.sort(
          (a, b) => calculateRating(b.comment) - calculateRating(a.comment),
        );
      }

      return {
        message: 'Products retrieved successfully',
        data: products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          cover: p.cover,
          category: p.category.name,
          price: p.skus[0]?.price,
          rating: calculateRating(p.comment),
          store: p.store.name,
        })),
        pagination: {
          totalCount,
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      };
    } catch (error) {
      logAndThrowInternalServerError(
        error,
        'GetProductsHandler',
        'Product/Retrieval',
        this.activityLogService,
        {
          storeId,
        },
      )
    }
  }
}
