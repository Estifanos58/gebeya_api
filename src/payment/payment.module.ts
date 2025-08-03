import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { EntityModule } from "@/entities/entity.module";
import { ChapaInitializePaymentHandler } from "./handler/chapa_initialize_handler";
import { ChapaWebhookHandler } from "./handler/chapa_webhook_handler";
import { HandlePaymentEvent } from "./event/handle_event";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { MailModule } from "@/mail/mail.module";
import { ChapaVerifyHandler } from "./handler/chapa_verify_handler";

const CommandHandlers = [ChapaInitializePaymentHandler, ChapaWebhookHandler, ChapaVerifyHandler];
const QueryHandlers= []

@Module({
    imports: [
        CqrsModule,
        EntityModule,
        ConfigModule,
        HttpModule,
        MailModule
    ],
    controllers: [PaymentController],
    providers: [...CommandHandlers, ...QueryHandlers, HandlePaymentEvent],
})

export class PaymentModule {}