import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/entities/user';

@Module({
  imports: [
      TypeOrmModule.forRoot({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "estif",
        password: "mypassword",
        database: "gebeya",
        entities: [User],
        synchronize: true
      })
    ,AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
