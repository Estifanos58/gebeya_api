import { Module } from '@nestjs/common';
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
  OrderDetails,
  Credentials,
  Store,
  Comment
} from './entities';
import { EntityModule } from './entities/entity.module';
import { ThrottlerModule,  ThrottlerGuard } from "@nestjs/throttler"
import { APP_GUARD } from "@nestjs/core"
import { ProductModule } from './product/product.module';

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
        OrderDetails,
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
    AuthModule,
    ConfigModule.forRoot(),
    MailModule,
    StoreModule,
    EntityModule,
    ThrottlerModule.forRoot([{
      name: "short",
      ttl: 1000,
      limit: 3
    },{
      name: "long",
      ttl: 60000,
      limit: 20
    }]),
    ProductModule
  ],
  controllers: [AppController],
  providers: [AppService, 
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule {}







/*





*/