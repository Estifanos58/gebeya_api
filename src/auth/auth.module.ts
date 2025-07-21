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

const CommandHandlers = [CreateUserHandler, ForgotPasswordHandler, LoginUserHandler, VerifyOtpHandler, ResetPasswordHandler];
const QueryHandlers = [GetUserHandler];
@Module({
  imports: [
    // TypeOrmModule.forFeature([User]), // Assuming User entity is imported from the correct path
    EntityModule,
    CqrsModule,
    MailModule
  ],
  controllers: [AuthController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class AuthModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(AuthenticateMiddleware).exclude('auth/login', 'auth/signup', 'auth/forgot-password').forRoutes('auth/*path')
  }
}
