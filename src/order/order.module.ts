import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { CreateOrderHandler } from "./handler/create_order.handler";
import { CqrsModule } from "@nestjs/cqrs";
import { EntityModule } from "@/entities/entity.module";


const CommandHandlers = [CreateOrderHandler]
const QueryHandlers = []
@Module({
    imports:[
        CqrsModule,
        EntityModule,
    ],
    controllers: [OrderController],
    providers:[...CommandHandlers, ...QueryHandlers]

})

export class OrderModule {}