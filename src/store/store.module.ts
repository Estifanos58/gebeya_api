import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { StoreController } from "./store.controller";
import { User } from "../auth/entities/user"
import { AuthenticateMiddleware } from "@/middleware/authenticate.middleware";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Store } from "./entities/store";
import { CqrsModule } from "@nestjs/cqrs";
import { MailModule } from "@/mail/mail.module";
import { CreateStoreHandler } from "./handlers/createStore.handler";

const CommandHandler = [CreateStoreHandler]

@Module({
    imports:[
    TypeOrmModule.forFeature([Store]),
    CqrsModule,
    MailModule,
    User
    ],
    controllers:[StoreController],
    providers:[...CommandHandler]

})

export class StoreModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthenticateMiddleware).exclude().forRoutes('store/*path')
    }
}