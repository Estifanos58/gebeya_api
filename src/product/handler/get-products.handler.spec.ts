import { Test, TestingModule } from '@nestjs/testing';
import { GetProductsHandler } from './get-products.handler';
import { Product, Comment } from '@/entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivityLogService } from '@/log/activityLog.service';
import { GetProductsQuery, ProductSortBy } from '../query/get-products.query';
import { QueryProductsDto } from '../dto/query-products.dto';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';
import { HttpException } from '@nestjs/common';

jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));

describe('GetProductsHandler', () => {
  let handler: GetProductsHandler;
  let productRepository: jest.Mocked<Repository<Product>>;
  let activityLogService: ActivityLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductsHandler,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: ActivityLogService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get(GetProductsHandler);
    productRepository = module.get(getRepositoryToken(Product));
    activityLogService = module.get(ActivityLogService);
  });

  const mockQueryBuilder = () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn(),
      getMany: jest.fn(),
    };
    jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(qb);
    return qb;
  };

  it('should default pagination when not provided', async () => {
    const qb = mockQueryBuilder();
    qb.getCount.mockResolvedValue(1);
    qb.getMany.mockResolvedValue([mockProduct([])]);

    const result = await handler.execute(new GetProductsQuery());
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.pageSize).toBe(10);
  });

  it('should filter by storeId', async () => {
    const qb = mockQueryBuilder();
    qb.getCount.mockResolvedValue(1);
    qb.getMany.mockResolvedValue([mockProduct([])]);
    const query = {
      storeId: '1',
    } as GetProductsQuery;

    await handler.execute(new GetProductsQuery(query.storeId));
    expect(qb.andWhere).toHaveBeenCalledWith('store.id = :storeId', {
      storeId: query.storeId,
    });
  });

  it('should filter by categoryId', async () => {
    const qb = mockQueryBuilder();
    qb.getCount.mockResolvedValue(1);
    qb.getMany.mockResolvedValue([mockProduct([])]);
    const query = {
      categoryId: '2',
    } as GetProductsQuery;
    await handler.execute(new GetProductsQuery(undefined, query.categoryId));
    expect(qb.andWhere).toHaveBeenCalledWith('category.id = :categoryId', {
      categoryId: query.categoryId,
    });
  });

  it('should filter by name', async () => {
    const qb = mockQueryBuilder();
    qb.getCount.mockResolvedValue(1);
    qb.getMany.mockResolvedValue([mockProduct([])]);

    const query = { name: 'Test' } as GetProductsQuery;
    await handler.execute(
      new GetProductsQuery(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        query.name,
      ),
    );
    expect(qb.andWhere).toHaveBeenCalledWith('product.name ILIKE :name', {
      name: `%${query.name}%`,
    });
  });

  it('should filter by price range', async () => {
    const qb = mockQueryBuilder();
    qb.getCount.mockResolvedValue(1);
    qb.getMany.mockResolvedValue([mockProduct([])]);

    const query = { minRange: 10, maxRange: 50 } as QueryProductsDto;
    await handler.execute(
      new GetProductsQuery(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        query.minRange,
        query.maxRange,
      ),
    );
    expect(qb.andWhere).toHaveBeenCalledWith(
      'skus.price BETWEEN :minRange AND :maxRange',
      {
        minRange: 10,
        maxRange: 50,
      },
    );
  });

  it('should sort in DESC order', async () => {
    const qb = mockQueryBuilder();
    qb.getCount.mockResolvedValue(1);
    qb.getMany.mockResolvedValue([mockProduct([])]);

    const query = { sortBy: 'name', sortOrder: 'DESC' } as GetProductsQuery;
    await handler.execute(
      new GetProductsQuery(
        undefined,
        undefined,
        query.sortBy,
        query.sortOrder,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ),
    );
    expect(qb.orderBy).toHaveBeenCalledWith('product.name', 'DESC');
  });

  it('should sort by rating when requested', async () => {
    const qb = mockQueryBuilder();
    const product1 = mockProduct([{ review: 5 }]);
    const product2 = mockProduct([{ review: 3 }]);
    qb.getCount.mockResolvedValue(2);
    qb.getMany.mockResolvedValue([product2, product1]);

    const query = { sortBy: ProductSortBy.RATING } as GetProductsQuery;
    const result = await handler.execute(
      new GetProductsQuery(undefined, undefined, query.sortBy),
    );
    expect(result.data[0].rating).toBeGreaterThanOrEqual(result.data[1].rating);
  });

  it('should throw NOT_FOUND if no products', async () => {
    const qb = mockQueryBuilder();
    qb.getCount.mockResolvedValue(0);
    qb.getMany.mockResolvedValue([]);

    await handler.execute(new GetProductsQuery());

    expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
      expect.any(HttpException),
      'GetProductsHandler',
      'Product/Retrieval',
      activityLogService,
      expect.any(Object),
    );
  });

  it('should return products with correct mapping', async () => {
    const qb = mockQueryBuilder();
    const product = mockProduct([{ review: 4 }]);
    qb.getCount.mockResolvedValue(1);
    qb.getMany.mockResolvedValue([product]);

    const result = await handler.execute(new GetProductsQuery());
    expect(result.data[0]).toMatchObject({
      id: product.id,
      name: product.name,
      description: product.description,
      cover: product.cover,
      category: product.category.name,
      price: product.skus[0].price,
      rating: expect.any(Number),
      store: product.store.name,
    });
  });

  it('should call logAndThrowInternalServerError on unexpected error', async () => {
    const qb = mockQueryBuilder();
    qb.getCount.mockRejectedValue(new Error('DB error'));

    const spy = jest
      .spyOn(
        require('@/utils/InternalServerError'),
        'logAndThrowInternalServerError',
      )
      .mockImplementation(() => {
        throw new Error('logged');
      });

    await expect(handler.execute(new GetProductsQuery())).rejects.toThrow(
      'logged',
    );
    expect(spy).toHaveBeenCalled();
  });

  function mockProduct(comments: Partial<Comment>[]): Product {
    return {
      id: 1,
      name: 'Product 1',
      description: 'Desc',
      cover: 'cover.jpg',
      category: { id: 1, name: 'Cat' } as any,
      skus: [{ price: 100 }] as any,
      store: { id: 1, name: 'Store' } as any,
      comment: comments as Comment[],
    } as unknown as Product;
  }
});
