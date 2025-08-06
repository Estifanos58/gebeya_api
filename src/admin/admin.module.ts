import { EntityModule } from "@/entities/entity.module";
import { ActivityLogModule } from "@/log/activityLog.module";
import { MailModule } from "@/mail/mail.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { StoreApproveEventHandler } from "./event/store/store_event_handler";
import { ApproveStoreHandler } from "./handler/approve_store.handler";
import { BanStoreHandler } from "./handler/ban_store.handler";


const CommandHandlers = [ApproveStoreHandler, BanStoreHandler]

@Module({
    imports: [
        CqrsModule,
        EntityModule,
        ActivityLogModule,
        MailModule
    ],
    controllers:[],
    providers:[StoreApproveEventHandler, ...CommandHandlers]
})

export class AdminModule {}