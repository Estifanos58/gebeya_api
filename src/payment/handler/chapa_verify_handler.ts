import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChapaVerifyCommand } from '../command/chapa_verify_command';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, Payment, PaymentStatus } from '@/entities';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SuccessfulPaymentEvent } from '../event/successful_payment.event';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@CommandHandler(ChapaVerifyCommand)
export class ChapaVerifyHandler implements ICommandHandler<ChapaVerifyCommand> {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly eventEmitter: EventEmitter2,

    private readonly httpService: HttpService,

    private readonly configService: ConfigService,
  ) {}

  async execute(command: ChapaVerifyCommand): Promise<any> {
    const { tx_ref } = command;

    const payment = await this.paymentRepository.findOne({
      where: { reference: tx_ref },
      relations: ['user']
    });
    if (!payment) {
      throw new NotFoundException('Payment with this reference not found');
    }

    // console.log("Paymetn Found: ", payment);

    const chapaVerifyUrl = this.configService.get<string>('CHAPA_VERIFY_URL');
    const chapaApiKey = this.configService.get<string>('CHAPA_SECRET_KEY');

    const url = `${chapaVerifyUrl}/${tx_ref}`;
    const response = await this.httpService.axiosRef.get(url, {
      headers: {
        Authorization: `Bearer ${chapaApiKey}`,
      },
    });

    // console.log("CHAPA Verification Response: ", response.data);
    if(response.status !== 200 || response.data.status === "failed"){
        throw new HttpException({
            message: "Payment Not Commplete",
            status: response.data.status
        }, HttpStatus.BAD_REQUEST)
        
    }

    if (payment.status === PaymentStatus.PENDING) {
      payment.status = PaymentStatus.SUCCESS;

      const order = await this.orderRepository.findOne({
        where: { payment: { id: payment.id } },
      });

      if (!order) {
        throw new NotFoundException(`Order for this payment not found`);
      }
      order.isPaid = true;


      await Promise.all([
        this.orderRepository.save(order),
        this.paymentRepository.save(payment),
      ])
      

      this.eventEmitter.emit(
        'payment.success',
        new SuccessfulPaymentEvent(
          payment.id,
          payment.amount,
          payment.currency,
          payment.user.id,
          payment.createdAt,
        ),
      );
    }

    return {
        message: "Verification Complete"
    }
  }
}
