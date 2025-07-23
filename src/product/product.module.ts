import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProductController } from './product.controller';
import { CreateProductHandler } from './handler/create-product.handler';
import { AuthenticateMiddleware } from '@/middleware/authenticate.middleware';
import { EntityModule } from '@/entities/entity.module';
import { CqrsModule } from '@nestjs/cqrs';


const CommandHandlers = [CreateProductHandler]

@Module({
  imports: [EntityModule, CqrsModule,],
  controllers: [ProductController],
  providers: [...CommandHandlers],
})
export class ProductModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticateMiddleware).forRoutes(ProductController);
  }
}
