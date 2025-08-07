import { ICommandHandler } from "@nestjs/cqrs";
import { UnBanStoreCommand } from "../command/upban_store.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Store } from "@/entities";
import { Repository } from "typeorm";
import { ActivityLogService } from "@/log/activityLog.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { NotFoundException } from "@nestjs/common";
import { StoreUnBanEvent } from "../event/store/store_unban_event";

export class UnBanStoreHandler implements ICommandHandler<UnBanStoreCommand>{

    constructor(
        @InjectRepository(Store)
        private readonly storeRepository: Repository<Store>,
        private readonly activityLogService: ActivityLogService,
        private readonly eventEmitter: EventEmitter2
    ){}

    async execute(command: UnBanStoreCommand): Promise<any> {
        const { storeId, user} = command;

        try {
            
            const store = await this.storeRepository.findOne({
                where: { id: storeId },
                relations: ['user'],
            });

            if (!store) {
                throw new NotFoundException(`Store with ID ${storeId} not found.`);
            }

            store.banned = false;
            await this.storeRepository.save(store);

            this.activityLogService.info(
                'Store has been unbanned',
                'Admin/UnBanStoreHandler',
                store.user.email,
                store.user.role,
                { StoreId: store.id, Owner_Email: store.user.email }
            );

            this.eventEmitter.emit('store.unbanned', new StoreUnBanEvent(store))

            return {
                message: `Store with ID ${storeId} has been unbanned successfully.`,
            };
        } catch (error) {
            logAndThrowInternalServerError(
                error,
                "UnBanStoreHandler",
                "Admin/UnBanStoreHandler",
                this.activityLogService,
                {storeId, email: user.email}
            )
        }
    }
}