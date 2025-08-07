import { EntityModule } from '@/entities/entity.module';
import { ActivityLogModule } from '@/log/activityLog.module';
import { MailModule } from '@/mail/mail.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApproveStoreHandler } from './handler/approve_store.handler';
import { BanStoreHandler } from './handler/ban_store.handler';
import { AdminController } from './admin.controller';
import { UserEventHandler } from './event/user/user_event_handler';
import { StoreEventHandler } from './event/store/store_event_handler';
import { UnBanStoreHandler } from './handler/unban_store.hanlder';
import { UserBanHandler } from './handler/ban_user.handler';
import { UserUnbanHandler } from './handler/unban_user.handler';

const CommandHandlers = [
  ApproveStoreHandler,
  BanStoreHandler,
  UnBanStoreHandler,
  UserBanHandler,
  UserUnbanHandler,
];

@Module({
  imports: [CqrsModule, EntityModule, ActivityLogModule, MailModule],
  controllers: [AdminController],
  providers: [StoreEventHandler, ...CommandHandlers, UserEventHandler],
})
export class AdminModule {}
