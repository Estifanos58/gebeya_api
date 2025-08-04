import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
  Comment,
  ActivityLog
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
import { CommentModule } from './comment/comment.module';
import { ActivityLogModule } from './log/activityLog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            url: configService.get<string>('DATABASE_URL'),
            ssl: {
              rejectUnauthorized: false, // Required for Neon's SSL
            },
            autoLoadEntities: true,
            entities:[
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
              Comment,
              ActivityLog
            ],
            synchronize: true, // Set to false in production
          }),
        }),
    EventEmitterModule.forRoot(),
    AuthModule,
    MailModule,
    StoreModule,
    EntityModule,
    OrderModule,
    CartModule,
    ProductModule,
    PaymentModule,
    CommentModule,
    ActivityLogModule,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticateMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.ALL },
        { path: 'auth/signup', method: RequestMethod.ALL },
        { path: 'auth/refresh-token', method: RequestMethod.ALL },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // 👈 applies to all routes
  }
}






/*





*/