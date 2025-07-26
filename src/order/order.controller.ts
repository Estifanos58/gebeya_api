import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { CreateOrderCommand } from './command/create_order.command';
import { CreateOrderDto } from './dto/create_order.dto';
import { GetOrdersQuery } from './query/get_orders.query';
import { OrderStatus } from '@/entities';

@Controller('order')
export class OrderController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createOrder(
    @Body() body: CreateOrderDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const order = await this.commandBus.execute(
      new CreateOrderCommand(
        req.user!,
        body.cartId,
        body.deliveryAddress,
        body.contactInfo,
      ),
    );
    return res.status(200).json({ ...order });
  }


  @Get()
  async getOrders(
    @Query('status') status: OrderStatus | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = req.userId!;
    const orders = await this.commandBus.execute(new GetOrdersQuery(userId, status));
    return res.status(200).json(orders);
  }
}
