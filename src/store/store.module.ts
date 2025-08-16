import { Module } from "@nestjs/common"
import { StoreController } from "./store.controller";
import { EntityModule } from "@/entities/entity.module";
import { CqrsModule } from "@nestjs/cqrs";
import { MailModule } from "@/mail/mail.module";
import { CreateStoreHandler } from "./handlers/createStore.handler";
import { GetAllStoreHandler } from "./handlers/get-all-stores.handler";
import { GetStoreHandler } from "./handlers/get-store.handler";
import { DeleteStoreHandler } from "./handlers/deleteStore.handler";
import { ActivityLogModule } from "@/log/activityLog.module";

const CommandHandler = [CreateStoreHandler, DeleteStoreHandler];
const QueryHandler = [GetAllStoreHandler, GetStoreHandler];

@Module({
    imports:[
    CqrsModule,
    MailModule,
    EntityModule,
    ActivityLogModule
    ],
    controllers:[StoreController],
    providers:[...CommandHandler, ...QueryHandler],

})

export class StoreModule{}