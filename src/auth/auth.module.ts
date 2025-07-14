import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserHandler } from './handlers/create-user.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user';
import { AuthenticateMiddleware } from 'src/middleware/authenticate.middleware';

const CommandHandlers = [CreateUserHandler];
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Assuming User entity is imported from the correct path
    CqrsModule
  ],
  controllers: [AuthController],
  providers: [...CommandHandlers],
})
export class AuthModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(AuthenticateMiddleware).exclude('auth/login', 'auth/signup').forRoutes('auth/*')
  }
}
