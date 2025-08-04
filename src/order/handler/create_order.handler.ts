import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from '../command/create_order.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, CartItem } from '@/entities';
import { Repository } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderItem } from '@/entities/order_item';
import { Order, OrderStatus } from '@/entities/order';
import { calculateCartTotal } from '@/utils/generalFunctions';
import { randomUUID } from 'crypto';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: CreateOrderCommand): Promise<any> {
    const { user, cartId, deliveryAddress, contactInfo } = command;

    const orderDeliveryAddress = deliveryAddress ?? user?.address;
    const orderContactInfo = contactInfo ?? user?.phoneNumber;

    if (!orderDeliveryAddress || !orderContactInfo) {
      throw new InternalServerErrorException(
        'Delivery address and contact info are required',
      );
    }

    try {
      const cart = await this.cartRepo.findOne({
        where: { id: cartId, user: { id: user.id } },
        relations: ['cartItems', 'cartItems.productSku', 'user'],
      });

      if (!cart) {
        throw new NotFoundException(`Cart not found with id ${cartId}`);
      }

      const totalPrice = calculateCartTotal(cart.cartItems);

      const order = this.orderRepo.create({
        user,
        total: totalPrice,
        orderNumber: `ORD-${randomUUID()}`,
        deliveryAddress: orderDeliveryAddress,
        contactInfo: orderContactInfo,
        items: cart.cartItems.map(item =>
          this.orderItemRepo.create({
            price: item.productSku.price,
            productSkus: item.productSku,
            quantity: item.quantity,
          }),
        ),
      });

      // Save order and all its items in one step via cascade
      const savedOrder = await this.orderRepo.save(order);

      // Delete cart — cartItems will be deleted automatically via cascade
      await this.cartRepo.delete(cart.id);

      this.activityLogService.info(
        'Order Created ',
        'Order/Creation',
        user?.email,
        user?.role,
        {
          userId: user.id,
          storeId: savedOrder.store.id,
          orderId: savedOrder.id,
          destination: orderDeliveryAddress,
          contactInfo: orderContactInfo,
          orderNumber: order.orderNumber,
          orderStatus: order.status 
        },
      )

      return {
        message: 'Order created successfully',
        data: savedOrder,
      };
    } catch (error) {
      logAndThrowInternalServerError(
        error,
        'CreateOrderHandler',
        'Order/Creation',
        this.activityLogService,
        {
          email: user?.email,
          role: user?.role,
          userId: user?.id,
          cartId: cartId,
        },  
      )
    }
  }
}
