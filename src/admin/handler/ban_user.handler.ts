import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import {  User } from '@/entities';
import { Repository } from 'typeorm';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserBanCommand } from '../command/ban_user.command';
import { UserBanEvent } from '../event/user/user_ban_event';

@CommandHandler(UserBanCommand)
export class UserBanHandler implements ICommandHandler<UserBanCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly activityLogService: ActivityLogService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(command:(UserBanCommand)): Promise<any> {
    const {userId } = command;

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if(!user) {
        throw new NotFoundException(`User with Id ${userId} Not Found`);
      }

      user.banned = true;
      await this.userRepository.save(user);
      this.eventEmitter.emit('user.banned', new UserBanEvent(user));
      
      this.activityLogService.info(
        'User has been banned',
        'Admin/UserBanHandler',
        user.email,
        user.role,
        { UserId: user.id}
      );

      return {
        message: `User with ID ${userId} has been banned successfully.`,
      };
    } catch (error) {
        logAndThrowInternalServerError(
            error,
            "UserBanHandler",
            "Admin/UserBanHandler",
            this.activityLogService,
            {userId}
        )
    }
  }
}
