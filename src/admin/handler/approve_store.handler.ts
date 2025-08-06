import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApproveStoreCommand } from '../command/approve_store.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from '@/entities';
import { Repository } from 'typeorm';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StoreApproveEvent } from '../event/store/store_approve.event';

@CommandHandler(ApproveStoreCommand)
export class ApproveStoreHandler
  implements ICommandHandler<ApproveStoreCommand>
{
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly activityLogService: ActivityLogService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ApproveStoreCommand): Promise<any> {
    const { storeId, isApproved, user } = command;

    try {
      const store = await this.storeRepository.findOne({
        where: { id: storeId },
        relations: ['user'],
      });

      if (!store) {
        throw new NotFoundException(`Store with ID ${storeId} not found.`);
      }

      if (!isApproved) {
        store.isVerified = false;
        await this.storeRepository.save(store);

        this.eventEmitter.emit(
          'store.disapproved',
          new StoreApproveEvent(store),
        );

        this.activityLogService.info(
          'Store has been disapproved',
          'Admin/ApproveStoreHandler',
          store.user.email,
          store.user.role,
          { StoreId: store.id, Owner_Email: store.user.email },
        );
        return {
          message: `Store with ID ${storeId} has been disapproved successfully.`,
        };
      }

      if (store.isVerified === isApproved) {
        throw new HttpException(
          {
            message: `Store is already ${isApproved ? 'approved' : 'disapproved'}`,
          },
          HttpStatus.CONFLICT,
        );
      }

      store.isVerified = isApproved;

      await this.storeRepository.save(store);

      this.eventEmitter.emit('store.approved', new StoreApproveEvent(store));

      this.activityLogService.info(
        'Store has been approved',
        'Admin/ApproveStoreHandler',
        store.user.email,
        store.user.role,
        { StoreId: store.id, Owner_Email: store.user.email },
      );

      return {
        message: `Store with ID ${storeId} has been approved successfully.`,
        store,
      };
    } catch (error) {
      logAndThrowInternalServerError(
        error,
        'Failed to approve store',
        'Admin/ApproveStoreHandler',
        this.activityLogService,
        { storeId },
      );
    }
  }
}
