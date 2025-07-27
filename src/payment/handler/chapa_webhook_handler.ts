import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChapaWebhookCommand } from '../command/chapa_webhook_command';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, Payment, PaymentStatus } from '@/entities';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(ChapaWebhookCommand)
export class ChapaWebhookHandler
  implements ICommandHandler<ChapaWebhookCommand>
{
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>
  ) {}

  async execute(command: ChapaWebhookCommand): Promise<any> {
    const { tx_ref, status } = command;

    const payment = await this.paymentRepo.findOne({
      where: { reference: tx_ref },
      relations: ['user'],
    });

    if (!payment)
      throw new NotFoundException('Payment With this reference Not Found');

    if (status === 'failed') payment.status = PaymentStatus.FAILED;
    if (status === 'success') payment.status = PaymentStatus.SUCCESS;
    if (status === 'timeout') payment.status = PaymentStatus.TIMEOUT;

    await this.paymentRepo.save(payment);

    if (status === 'success') {
      // 1. Mark order as paid
      await this.orderRepository.update(
        { id: payment.orderId },
        { isPaid: true },
      );

      // 2. Emit event (if using domain events later)

      // 3. Optionally notify merchant or admin
    }

    return { message: 'Webhook processed' };
  }
}
