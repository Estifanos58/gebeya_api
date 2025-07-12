import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { User } from './entities/user';

@Module({
  controllers: [AuthController],
  exports: [User]
})
export class AuthModule {}
