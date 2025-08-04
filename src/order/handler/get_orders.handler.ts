import { CommandHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOrdersQuery } from '../query/get_orders.query';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '@/entities';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';


@CommandHandler(GetOrdersQuery)
export class GetOrdersHandler implements IQueryHandler<GetOrdersQuery> {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly activityLogService: ActivityLogService,
  ) {}
  async execute(query: GetOrdersQuery): Promise<any> {
    const { userId, status } = query;

    try {
      const whereOptions: FindOptionsWhere<Order> = { user: { id: userId } };
      if (status) whereOptions.status = status;

      const orders = await this.orderRepo.find({
        where: whereOptions,
        relations: ['items', 'items.productSkus'],
      });

      if (!orders || orders.length === 0) {
        throw new NotFoundException(
          `No orders found for user with ID ${userId}`,
        );
      }

      return {
        message: 'Orders retrieved successfully',
        data: orders,
      };
    } catch (error) {
      logAndThrowInternalServerError(
        error,
        'GetOrdersHandler',
        'GetOrdersQuery',
        this.activityLogService,
        {
          userId
        },
      )
    }
  }
}
