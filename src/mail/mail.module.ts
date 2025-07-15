import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/auth/entities/user";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        ConfigModule, // Makes the configuration available globally
        TypeOrmModule.forFeature([User]) // Add any entities if needed
    ],
    controllers: [],
    providers: [MailService],
    exports: [MailService] // Export the service to be used in other modules
})

export class MailModule{}