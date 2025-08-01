import { Module } from "@nestjs/common"
import { StoreController } from "./store.controller";
import { EntityModule } from "@/entities/entity.module";
import { CqrsModule } from "@nestjs/cqrs";
import { MailModule } from "@/mail/mail.module";
import { CreateStoreHandler } from "./handlers/createStore.handler";
import { CreateCategoryHandler } from "./handlers/create-category.handler";
import { GetAllStoreHandler } from "./handlers/get-all-stores.handler";
import { GetStoreHandler } from "./handlers/get-store.hanlder";
import { DeleteStoreHandler } from "./handlers/deleteStore.handler";
import { CreateCommentHandler } from "./handlers/create-comment.handler";

const CommandHandler = [CreateStoreHandler, CreateCategoryHandler, DeleteStoreHandler, CreateCommentHandler];
const QueryHandler = [GetAllStoreHandler, GetStoreHandler];

@Module({
    imports:[
    CqrsModule,
    MailModule,
    EntityModule
    ],
    controllers:[StoreController],
    providers:[...CommandHandler, ...QueryHandler],

})

export class StoreModule{}