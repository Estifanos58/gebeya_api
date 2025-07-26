import { ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from '../command/create_order.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, CartItem } from '@/entities';
import { Repository } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderItem } from '@/entities/order_item';
import { Order } from '@/entities/order';
import { calculateCartTotal } from '@/utils/generalFunctions';
import { randomUUID } from 'crypto';

export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItem: Repository<CartItem>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async execute(command: CreateOrderCommand): Promise<any> {
    const { user, cartId, deliveryAddress, contactInfo } = command;

    let orderDeliveryAddress = deliveryAddress ?? user?.address;
    let orderContactInfo = contactInfo ?? user?.phoneNumber;

    if(!orderDeliveryAddress || !orderContactInfo) {
      throw new InternalServerErrorException('Delivery address and contact info are required')
    }

    try {
      const cart = await this.cartRepo.findOne({
        where: { id: cartId, user: user },
        relations: ['cartItems', 'cartItems.productSku', 'user'],
      });


      if (!cart) {
        throw new NotFoundException(`Cart Not Found With the ${cartId} :id`);
      }

      const totalPrice = calculateCartTotal(cart.cartItems);

      let orderItems: OrderItem[] = [];

      for (const item of cart.cartItems) {
        const orderItem = this.orderItemRepo.create({
          productSkus: item.productSku,
          quantity: item.quantity,
        });
        const savedOrderItem = await this.orderItemRepo.save(orderItem);
        orderItems.push(savedOrderItem);
        await this.cartItem.remove(item)
      }

      const order = this.orderRepo.create({
        user: user,
        total: totalPrice,
        items: orderItems,
        orderNumber: `ORD-${randomUUID()}`,
        deliveryAddress: orderDeliveryAddress,
        contactInfo: orderContactInfo,
      });

      await Promise.all([
         this.cartRepo.remove(cart),
         this.orderRepo.save(order),
      ]);

      return {
        message: 'Order created Successfully',
        data: order,
      };
    } catch (error) {
      console.error('Order creation failed:', error);
      throw new InternalServerErrorException(error.message);

    }
  }
}
