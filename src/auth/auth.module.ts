import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserHandler } from './handlers/create-user.handler';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from '@/entities';
import { AuthenticateMiddleware } from 'src/middleware/authenticate.middleware';
import { MailModule } from 'src/mail/mail.module';
import { ForgotPasswordHandler } from './handlers/forgot-password.handler';
import { LoginUserHandler } from './handlers/login-user.handler';
import { EntityModule } from '@/entities/entity.module';
import { VerifyOtpHandler } from './handlers/verifyOtp.handler';
import { ResetPasswordHandler } from './handlers/reset-password.handler';
import { GetUserHandler } from './handlers/get-user.handler';
import { RefreshTokenHandler } from './handlers/refresh-token.handler';
import { UserRegisterHandler } from './event/user_register.handler';
import { UserPasswordResetHandler } from './event/user_password.handler';
import { ActivityLogModule } from '@/log/activityLog.module';

const CommandHandlers = [CreateUserHandler, ForgotPasswordHandler, LoginUserHandler, VerifyOtpHandler, ResetPasswordHandler, RefreshTokenHandler];
const QueryHandlers = [GetUserHandler];
@Module({
  imports: [
    // TypeOrmModule.forFeature([User]), // Assuming User entity is imported from the correct path
    EntityModule,
    CqrsModule,
    MailModule,
    ActivityLogModule
  ],
  controllers: [AuthController],
  providers: [...CommandHandlers, ...QueryHandlers, UserRegisterHandler, UserPasswordResetHandler],
})
export class AuthModule{}
