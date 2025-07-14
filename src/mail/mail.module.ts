import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/auth/entities/user";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]) // Add any entities if needed
    ],
    controllers: [],
    providers: [MailService],
})

export class MailModule{}