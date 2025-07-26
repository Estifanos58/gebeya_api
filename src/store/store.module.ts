import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { StoreController } from "./store.controller";
// import { User } from "@/entities/user"
import { AuthenticateMiddleware } from "@/middleware/authenticate.middleware";
// import { TypeOrmModule } from "@nestjs/typeorm";
// import { Store } from "./entities/store";
import { EntityModule } from "@/entities/entity.module";
import { CqrsModule } from "@nestjs/cqrs";
import { MailModule } from "@/mail/mail.module";
import { CreateStoreHandler } from "./handlers/createStore.handler";
import { CreateCategoryHandler } from "./handlers/create-category.handler";
import { GetAllStoreHandler } from "./handlers/get-all-stores.handler";
import { GetStoreHandler } from "./handlers/get-store.hanlder";

const CommandHandler = [CreateStoreHandler, CreateCategoryHandler];
const QueryHandler = [GetAllStoreHandler, GetStoreHandler];

@Module({
    imports:[
    // TypeOrmModule.forFeature([Store]), 
    CqrsModule,
    MailModule,
    EntityModule
    // User
    ],
    controllers:[StoreController],
    providers:[...CommandHandler, ...QueryHandler],

})

export class StoreModule{}