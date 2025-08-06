import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { BanStoreCommand } from '../command/ban_store.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from '@/entities';
import { Repository } from 'typeorm';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StoreBanEvent } from '../event/store/store_ban_event';

@CommandHandler(BanStoreCommand)
export class BanStoreHandler implements ICommandHandler<BanStoreCommand> {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly activityLogService: ActivityLogService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(command: BanStoreCommand): Promise<any> {
    const { storeId, reason, user } = command;

    try {
      const store = await this.storeRepository.findOne({
        where: { id: storeId },
        relations: ['user'],
      });

      if(!store) {
        throw new NotFoundException(`Store with Id ${storeId} Not Found`);
      }

      store.banned = true;
      this.eventEmitter.emit('store.banned', new StoreBanEvent(store, reason));
      await this.storeRepository.save(store);
      
      this.activityLogService.info(
        'Store has been banned',
        'Admin/BanStoreHandler',
        store.user.email,
        store.user.role,
        { StoreId: store.id, Owner_Email: store.user.email, Reason: reason }
      );

      return {
        message: `Store with ID ${storeId} has been banned successfully.`,
      };
    } catch (error) {
        logAndThrowInternalServerError(
            error,
            "BanStoreHandler",
            "Admin/BanStoreHandler",
            this.activityLogService,
            {storeId, email: user.email}
        )
    }
  }
}
