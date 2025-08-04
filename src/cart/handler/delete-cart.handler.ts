import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCartCommand } from '../command/delete-cart.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '@/entities';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@CommandHandler(DeleteCartCommand)
export class DeleteCartHandler implements ICommandHandler<DeleteCartCommand> {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: DeleteCartCommand): Promise<any> {
    const { userId } = command;

    let currentCart: Cart | null = null;
    try {
      const cart = await this.cartRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!cart) {
        throw new NotFoundException(`Cart for user ${userId} not found`);
      }
      currentCart = cart;

      await this.cartRepository.remove(cart);

      return {
        message: `Cart for user ${userId} deleted successfully`,
      };
    } catch (error) {
        logAndThrowInternalServerError(
            error,
            'DeleteCartHandler',
            'Cart/Deletion',
            this.activityLogService,
            { userId, cartId: currentCart?.id },
        )
    }
  }
}
