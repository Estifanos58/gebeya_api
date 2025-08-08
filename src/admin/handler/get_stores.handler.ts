import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from '@/entities';
import { Repository } from 'typeorm';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';
import { ActivityLogService } from '@/log/activityLog.service';
import { GetStoresQuery, StoreSortQuery } from '../query/get_stores.query';
import { BadRequestException } from '@nestjs/common';

@QueryHandler(GetStoresQuery)
export class GetStoresHandler implements IQueryHandler<GetStoresQuery> {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly activityLogService: ActivityLogService,
  ) {}

async execute(query: GetStoresQuery): Promise<any> {
  const { search, verified, sortBy, order, banned, page, limit } = query;

  try {
    const pageNumber = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 10;
    const skip = (pageNumber - 1) * pageSize;
    if (!Object.values(StoreSortQuery).includes(sortBy as StoreSortQuery))
        throw new BadRequestException('Invalid sortBy value');

    const queryBuilder = this.storeRepository
      .createQueryBuilder('store')
      .leftJoin('store.user', 'user');

    if (search) {
      queryBuilder.andWhere(
        'store.name ILIKE :search OR user.firstName ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (verified !== null) {
      queryBuilder.andWhere('store.isVerified = :verified', { verified });
    }

    if (banned !== null) {
      queryBuilder.andWhere('user.banned = :banned', { banned });
    }

    if (sortBy === StoreSortQuery.STORE_PRODUCTS || sortBy === StoreSortQuery.STORE_ORDERS) {
      queryBuilder
        .leftJoin('store.products', 'product')
        .leftJoin('store.orders', 'order')
        .groupBy('store.id')
        .addSelect('COUNT(DISTINCT product.id)', 'productCount')
        .addSelect('COUNT(DISTINCT order.id)', 'orderCount');

      if (sortBy === StoreSortQuery.STORE_PRODUCTS) {
        queryBuilder.orderBy('productCount', order.toUpperCase() as 'ASC' | 'DESC');
      } else {
        queryBuilder.orderBy('orderCount', order.toUpperCase() as 'ASC' | 'DESC');
      }
    } else {
      queryBuilder.orderBy(`store.${sortBy}`, order.toUpperCase() as 'ASC' | 'DESC');
    }

    const total = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(pageSize);

    const { entities, raw } = await queryBuilder.getRawAndEntities();
    const storesWithCounts = entities.map((store, index) => {
      const rawRow = raw[index];
      return {
        ...store,
        productCount: Number(rawRow.productCount) || 0,
        orderCount: Number(rawRow.orderCount) || 0,
      };
    });

    return {
      message: 'Stores retrieved successfully',
      data: storesWithCounts,
      total,
      page: pageNumber,
      limit: pageSize,
    };
  } catch (error) {
    logAndThrowInternalServerError(
      error,
      'GetStoresHandler',
      'Admin/Users/Retrieval',
      this.activityLogService,
    );
  }
}

}
