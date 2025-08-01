import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChapaInitializePaymentCommand } from '../command/chapa_initialize_commannd';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentGateway, PaymentStatus, Store } from '@/entities';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { decrypt } from '@/utils/encryption';
import { ConfigService } from '@nestjs/config';
import { generateReference } from '@/utils/generalFunctions';
import { HttpService } from '@nestjs/axios';


@CommandHandler(ChapaInitializePaymentCommand)
export class ChapaInitializePaymentHandler
  implements ICommandHandler<ChapaInitializePaymentCommand>
{
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async execute(command: ChapaInitializePaymentCommand): Promise<any> {
    const {
      user,
      storeId,
      amount,
      orderId,
      first_name,
      last_name,
      email,
      currency,
    } = command;

    const store = await this.storeRepository.findOne({
      where: { id: storeId },
      relations: ['user'],
    });

    if (!store) {
      throw new HttpException(
        'Store not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const chapaApiKey = this.configService.get<string>('CHAPA_API_KEY');
    const chapaUrl = this.configService.get<string>('CHAPA_INITIALIZER');
    const BASE_URL = this.configService.get<string>('BASE_URL');
    const FRONTEND_URL = this.configService.get<string>('FRONTEND_URL');
    const reference = generateReference();

    const payload = {
      tx_ref: reference,
      amount: amount,
      currency: currency ?? 'ETB',
      first_name: first_name ?? user.firstName,
      last_name: last_name ?? user.lastName,
      email: email ?? user.email,
      callback_url: `${BASE_URL}/payments/chapa/webhook`,
      return_url: `${FRONTEND_URL}/thank-you`,
      customization: {
        title: "Payment for Order",
        description: 'Payment from customer',
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
        },
      );

      const payment = this.paymentRepository.create({
        amount,
        gateway: PaymentGateway.CHAPA,
        reference,
        user,
        order: { id: orderId },
        store,
        status: PaymentStatus.PENDING,
        paymentUrl: response.data?.data?.checkout_url,
      });

      await this.paymentRepository.save(payment);

      return {
        message: 'Payment initialized',
        checkout_url: response.data?.data?.checkout_url,
        reference,
      };
    } catch (error) {
      throw new HttpException(
        error?.response?.data?.message || 'Payment initialization failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
