import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProductController } from './product.controller';
import { CreateProductHandler } from './handler/create-product.handler';
import { AuthenticateMiddleware } from '@/middleware/authenticate.middleware';
import { EntityModule } from '@/entities/entity.module';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateProductHandler } from './handler/update-product.handler';
import { FindProductHandler } from './handler/find-product.handler';
import { GetProductsHandler } from './handler/get-products.handler';


const CommandHandlers = [CreateProductHandler, UpdateProductHandler];
const QueryHandlers = [FindProductHandler, GetProductsHandler];

@Module({
  imports: [EntityModule, CqrsModule,],
  controllers: [ProductController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class ProductModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticateMiddleware).forRoutes(ProductController);
  }
}
