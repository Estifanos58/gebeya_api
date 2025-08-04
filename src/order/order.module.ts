import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { CreateOrderHandler } from "./handler/create_order.handler";
import { CqrsModule } from "@nestjs/cqrs";
import { EntityModule } from "@/entities/entity.module";
import { GetOrdersHandler } from "./handler/get_orders.handler";
import { GetStoreOrdersQuery } from "./query/get_store_orders.query";
import { ActivityLogModule } from "@/log/activityLog.module";


const CommandHandlers = [CreateOrderHandler]
const QueryHandlers = [GetOrdersHandler, GetStoreOrdersQuery]
@Module({
    imports:[
        CqrsModule,
        EntityModule,
        ActivityLogModule
    ],
    controllers: [OrderController],
    providers:[...CommandHandlers, ...QueryHandlers]

})

export class OrderModule {}