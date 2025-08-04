import { Module } from "@nestjs/common";
import { CartController } from "./cart.controller";
import { DeleteCartItemHandler } from "./handler/delete-cartItem.handler";
import { DeleteCartHandler } from "./handler/delete-cart.handler";
import { CreateCartHandler } from "./handler/create-cart.handler";
import { UpdateCartHandler } from "./handler/update-cart.handler";
import { GetCartHandler } from "./handler/get-cart.handler";
import { EntityModule } from "@/entities/entity.module";
import { CqrsModule } from "@nestjs/cqrs";
import { ActivityLogModule } from "@/log/activityLog.module";

const CommandHandlers = [DeleteCartItemHandler, DeleteCartHandler, CreateCartHandler, UpdateCartHandler]
const QueryHandlers = [GetCartHandler]
@Module({
    imports: [
        EntityModule,
        ActivityLogModule,
        CqrsModule
    ],
    controllers: [CartController],
    providers:[...CommandHandlers, ...QueryHandlers],
})

export class CartModule {}