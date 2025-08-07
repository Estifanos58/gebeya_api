import { ActivityLogService } from '@/log/activityLog.service';
import { MailService } from '@/mail/mail.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserBanEvent } from './user_ban_event';
import { USER_BANNED_TEMPLATE, USER_UNBANNED_TEMPLATE } from '@/utils/templates';
import { UserUnBanEvent } from './user_unban_event';

@Injectable()
export class UserEventHandler {
  constructor(
    private readonly mailService: MailService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @OnEvent('user.banned')
  handleUserBannedEvent(payload: UserBanEvent) {
    const { user } = payload;
    try {
      const html = USER_BANNED_TEMPLATE,
        mail = {
          to: user.email,
          subject: 'Account Banned Notification',
          html: html,
          placeholders: {
            name: user.firstName,
            supportLink: 'https://support.yourapp.com',
            year: new Date().getFullYear().toString(),
          },
        };

      this.mailService.sendMail(mail).catch((error) => {
        this.activityLogService.error(
          'Failed to send User Banned email',
          'Admin/UserBanEvent',
          user.email,
          user.role,
          { UserId: user.id, error: error.message },
        );
      });
    } catch (error) {
      this.activityLogService.error(
        'Failed to handle user ban event',
        'Admin/UserEventHandler',
        user.email,
        user.role,
        {
          UserId: user.id,
          Owner_Email: user.email,
          error: error.message,
        },
      );
    }
  }

  @OnEvent('user.unbanned')
  handleUserUnbannedEvent(payload: UserUnBanEvent) { 
    const { user } = payload;

    try {
      const html = USER_UNBANNED_TEMPLATE,
        mail = {
          to: user.email,
          subject: 'Account Unbanned Notification',
          html: html,
          placeholders: {
            name: user.firstName,
            year: new Date().getFullYear().toString(),
          },
        };

      this.mailService.sendMail(mail).catch((error) => {
        this.activityLogService.error(
          'Failed to send User Unbanned email',
          'Admin/UserUnbanEvent',
          user.email,
          user.role,
          { UserId: user.id, error: error.message },
        );
      });
    } catch (error) {
      this.activityLogService.error(
        'Failed to handle user unban event',
        'Admin/UserEventHandler',
        user.email,
        user.role,
        {
          UserId: user.id,
          Owner_Email: user.email,
          error: error.message,
        },
      );
    }   
  }

}
