import { Cart } from '@/entities';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {} 

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredCart() {
    const expirationDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await this.cartRepository.delete({
      createdAt: LessThan(expirationDate),
    });

    this.logger.log(`Deleted ${result.affected} expired carts.`);
  }
}
