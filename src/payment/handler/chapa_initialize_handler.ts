import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChapaInitializePaymentCommand } from '../command/chapa_initialize_commannd';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Order,
  Payment,
  PaymentGateway,
  PaymentStatus,
  Store,
} from '@/entities';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateReference } from '@/utils/generalFunctions';
import { HttpService } from '@nestjs/axios';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@CommandHandler(ChapaInitializePaymentCommand)
export class ChapaInitializePaymentHandler
  implements ICommandHandler<ChapaInitializePaymentCommand>
{
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: ChapaInitializePaymentCommand): Promise<any> {
    const { user, storeId, orderId } = command;

    const store = await this.storeRepository.findOne({
      where: { id: storeId },
      relations: ['user'],
    });

    if (!store) {
      throw new HttpException('Store not found', HttpStatus.BAD_REQUEST);
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: user.id } },
      relations: ['items', 'items.productSkus'],
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.BAD_REQUEST);
    }

    const paymentExists = await this.paymentRepository.findOne({
      where: { order: {id: order.id}},
    });

    if (paymentExists) {
      throw new HttpException(
        'Payment already exists for this order',
        HttpStatus.BAD_REQUEST,
      );
    }

    const chapaApiKey = this.configService.get<string>('CHAPA_SECRET_KEY');
    const chapaUrl = this.configService.get<string>('CHAPA_INITIALIZER');
    const BASE_URL = this.configService.get<string>('BASE_URL');
    const FRONTEND_URL = this.configService.get<string>('FRONTEND_URL');
    const reference = generateReference();

    const payload = {
      amount: order.total,
      currency: 'ETB',
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      phone_number: user.phoneNumber,
      tx_ref: reference,
      callback_url: `${BASE_URL}/payment/chapa/webhook`,
      return_url: 'https://www.google.com/',
      customization: {
        title: 'Payment',
        description: 'I love online payments',
      },
    };

    try {
      const response = await this.httpService.axiosRef.post(
        chapaUrl!,
        payload,
        {
          headers: {
            Authorization: `Bearer ${chapaApiKey}`,
          },
          timeout: 10000, // 10 seconds
        },
      );

      const payment = this.paymentRepository.create({
        amount: order.total,
        reference,
        gateway: PaymentGateway.CHAPA,
        status: PaymentStatus.PENDING,
        paymentUrl: response.data?.data?.checkout_url,
        user,
        order,
        store,
      });

      await this.paymentRepository.save(payment);

      return {
        message: 'Payment initialization successful',
        checkout_url: response.data?.data?.checkout_url,
        reference,
      };
    } catch (error) {
      logAndThrowInternalServerError(
        error,
        'ChapaInitializePaymentHandler',
        'Chapa Payment Initialization',
        this.activityLogService,
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          storeId: store.id,
          orderId: order.id,
        },
      )
    }
  }
}
