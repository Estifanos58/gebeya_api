import { Module } from "@nestjs/common";
import { CartController } from "./cart.controller";
import { DeleteCartItemHandler } from "./handler/delete-cartItem.handler";
import { DeleteCartHandler } from "./handler/delete-cart.handler";
import { CreateCartHandler } from "./handler/create-cart.handler";
import { UpdateCartHandler } from "./handler/update-cart.handler";
import { GetCartHandler } from "./handler/get-cart.handler";

const CommandHandlers = [DeleteCartItemHandler, DeleteCartHandler, CreateCartHandler, UpdateCartHandler]
const QueryHandlers = [GetCartHandler]
@Module({
    imports: [],
    controllers: [CartController],
    providers:[...CommandHandlers, ...QueryHandlers],
})

export class CartModule {}