import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { StoreModule } from './store/store.module';
import {
  User,
  Cart,
  CartItem,
  Product,
  ProductSkus,
  Category,
  Payment,
  Order,
  OrderItem,
  Credentials,
  Store,
  Comment
} from './entities';
import { EntityModule } from './entities/entity.module';
import { ThrottlerModule,  ThrottlerGuard } from "@nestjs/throttler"
import { APP_GUARD } from "@nestjs/core"
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { AuthenticateMiddleware } from './middleware/authenticate.middleware';
import { PaymentModule } from './payment/payment.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'estif',
      password: 'mypassword',
      database: 'gebeya',
      entities: [
        User,
        CartItem,
        Cart,
        Order,
        OrderItem,
        Payment,
        Product,
        ProductSkus,
        Category,
        Credentials,
        Store,
        Comment
      ], // This is imported for the synchrozation
      synchronize: true,
    }),
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    AuthModule,
    MailModule,
    StoreModule,
    EntityModule,
    OrderModule,
    CartModule,
    ProductModule,
    PaymentModule,
    ThrottlerModule.forRoot([{
      name: "short",
      ttl: 1000,
      limit: 3
    },{
      name: "long",
      ttl: 60000,
      limit: 20
    }]),
  ],
  controllers: [AppController],
  providers: [AppService, 
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
      consumer.apply(AuthenticateMiddleware).exclude('auth/login', 'auth/signup', 'auth/forgot-password').forRoutes('auth/*path')
  }
}







/*





*/