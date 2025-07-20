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

const CommandHandlers = [CreateUserHandler, ForgotPasswordHandler, LoginUserHandler];
@Module({
  imports: [
    // TypeOrmModule.forFeature([User]), // Assuming User entity is imported from the correct path
    EntityModule,
    CqrsModule,
    MailModule
  ],
  controllers: [AuthController],
  providers: [...CommandHandlers],
})
export class AuthModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(AuthenticateMiddleware).exclude('auth/login', 'auth/signup', 'auth/forgot-password').forRoutes('auth/*path')
  }
}
