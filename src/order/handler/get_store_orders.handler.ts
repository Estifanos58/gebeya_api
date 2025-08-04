import { CommandHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '@/entities';
import { FindOptionsWhere, Repository } from 'typeorm';
import { GetStoreOrdersQuery } from '../query/get_store_orders.query';


@CommandHandler(GetStoreOrdersQuery)
export class GetOrdersHandler implements IQueryHandler<GetStoreOrdersQuery> {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}
  async execute(query: GetStoreOrdersQuery): Promise<any> {
    const { userId, storeId, status } = query;

    try {
      const whereOptions: FindOptionsWhere<Order> = { store: { id: storeId , user: {id: userId}} };
      if (status) whereOptions.status = status;

      const orders = await this.orderRepo.find({
        where: whereOptions,
        relations: ['items', 'items.productSkus', 'store', 'store.user'],
      });

      if (!orders || orders.length === 0) {
        throw new NotFoundException(
          `No orders found for store with ID ${storeId}`,
        );
      }

      return {
        message: 'Store Orders retrieved successfully',
        data: orders,
      };
    } catch (error) {
      console.error('Store Orders retrieval failed:', error)
      throw new InternalServerErrorException(error.message);
    }
  }
}
