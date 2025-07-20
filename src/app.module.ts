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
} from './entities';
import { EntityModule } from './entities/entity.module';

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
      ], // This is imported for the synchrozation
      synchronize: true,
    }),
    AuthModule,
    ConfigModule.forRoot(),
    MailModule,
    StoreModule,
    EntityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
