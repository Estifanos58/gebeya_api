import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { CreateOrderHandler } from "./handler/create_order.handler";
import { CqrsModule } from "@nestjs/cqrs";
import { EntityModule } from "@/entities/entity.module";
import { GetOrdersHandler } from "./handler/get_orders.handler";


const CommandHandlers = [CreateOrderHandler]
const QueryHandlers = [GetOrdersHandler]
@Module({
    imports:[
        CqrsModule,
        EntityModule,
    ],
    controllers: [OrderController],
    providers:[...CommandHandlers, ...QueryHandlers]

})

export class OrderModule {}