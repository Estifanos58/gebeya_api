import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChapaWebhookCommand } from '../command/chapa_webhook_command';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, Payment, PaymentStatus } from '@/entities';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SuccessfulPaymentEvent } from '../event/successful_payment.event';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@CommandHandler(ChapaWebhookCommand)
export class ChapaWebhookHandler
  implements ICommandHandler<ChapaWebhookCommand>
{
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly eventEmitter: EventEmitter2,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: ChapaWebhookCommand): Promise<any> {
    const { tx_ref, status } = command;

    let currentPayment: Payment| null = null;
    try {
      const payment = await this.paymentRepo.findOne({
        where: { reference: tx_ref },
        relations: ['user'],
      });

      if (!payment) throw new NotFoundException('Payment With this reference Not Found');

      currentPayment = payment;
      if (status === 'failed') {
        this.activityLogService.warn(
          'Chapa Payment Failed',
          'ChapaWebhookHandler',
            payment.user.email,
            payment.user.role,
            {
              userId: payment.user.id,
              paymentId: payment.id,
              tx_ref: payment.reference,
            }
        )
        payment.status = PaymentStatus.FAILED;
      }
      if (status === 'success'){ 
        this.activityLogService.info(
          'Chapa Payment Successful',
          'ChapaWebhookHandler',
            payment.user.email,
            payment.user.role,
            {
              userId: payment.user.id,
              paymentId: payment.id,
              tx_ref: payment.reference,
            }
        )
        payment.status = PaymentStatus.SUCCESS
      };
      if (status === 'timeout') {
        this.activityLogService.warn(
          'Chapa Payment Timeout',
          'ChapaWebhookHandler',
            payment.user.email,
            payment.user.role,
            {
              userId: payment.user.id,
              paymentId: payment.id,
              tx_ref: payment.reference,
            }
        )
        payment.status = PaymentStatus.TIMEOUT
      };

      await this.paymentRepo.save(payment);

      if (status === 'success') {
        // 1. Mark order as paid
        await this.orderRepository.update(
          { id: payment.order?.id },
          { isPaid: true },
        );

        // 2. Emit event (if using domain events later)
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

        // 3. Optionally notify merchant or admin
      }

      return { message: 'Webhook processed successfully' };
    } catch (error) {
      logAndThrowInternalServerError(
        error,
        'ChapaWebhookHandler',
        'Chapa Webhook Handler',
        this.activityLogService,
        {
          paymentId: currentPayment?.id,
          userId: currentPayment?.user?.id,
        },
      );
    }
  }
}
