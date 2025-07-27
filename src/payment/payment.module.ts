import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { EntityModule } from "@/entities/entity.module";
import { ChapaInitializePaymentHandler } from "./handler/chapa_initialize_handler";
import { ChapaWebhookHandler } from "./handler/chapa_webhook_handler";

const CommandHandlers = [ChapaInitializePaymentHandler, ChapaWebhookHandler];
const QueryHandlers= []

@Module({
    imports: [
        CqrsModule,
        EntityModule
    ],
    controllers: [PaymentController],
    providers: [...CommandHandlers, ...QueryHandlers],
})

export class PaymentModule {}