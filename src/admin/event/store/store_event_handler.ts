import { ActivityLogService } from '@/log/activityLog.service';
import { MailService } from '@/mail/mail.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StoreApproveEvent } from './store_approve.event';
import {
  STORE_APPROVED_TEMPLATE,
  STORE_BANNED_TEMPLATE,
  STORE_DISAPPROVED_TEMPLATE,
} from '@/utils/templates';
import { StoreBanEvent } from './store_ban_event';

@Injectable()
export class StoreApproveEventHandler {
  constructor(
    private readonly mailService: MailService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @OnEvent('store.approved')
  handleStoreApprovedEvent(payload: StoreApproveEvent) {
    const { store } = payload;

    try {
      const html = STORE_APPROVED_TEMPLATE;
      const mail = {
        to: store.user.email,
        subject: 'Store Approval Notification',
        html: html,
        placeholders: {
          name: store.user.firstName,
          storeName: store.name,
          dashboardLink: 'https://yourapp.com/dashboard',
          year: new Date().getFullYear().toString(),
        },
      };
      this.mailService.sendMail(mail);
    } catch (error) {
      this.activityLogService.error(
        'Failed to handle store approval event',
        'Admin/StoreApproveEvent',
        store.user.email,
        store.user.role,
        {
          StoreId: store.id,
          Owner_Email: store.user.email,
          error: error.message,
        },
      );
    }
  }

  @OnEvent('store.disapproved')
  handleStoreDisapprovedEvent(payload: StoreApproveEvent) {
    const { store } = payload;

    try {
      const html = STORE_DISAPPROVED_TEMPLATE;
      const mail = {
        to: store.user.email,
        subject: 'Store Disapproval Notification',
        html: html,
        placeholders: {
          name: store.user.firstName,
          storeName: store.name,
          reason:
            'Your store has been disapproved by the admin. Please contact support for more',
          supportLink: 'https://support.yourapp.com',
          year: new Date().getFullYear().toString(),
        },
      };
      this.mailService.sendMail(mail).catch((error) => {
        this.activityLogService.error(
          'Failed to send store Disapproval email',
          'Admin/StoreApproveEvent',
          store.user.email,
          store.user.role,
          { StoreId: store.id, error: error.message },
        );
      });
    } catch (error) {
      this.activityLogService.error(
        'Failed to handle store disapproval event',
        'Admin/StoreApproveEvent',
        store.user.email,
        store.user.role,
        {
          StoreId: store.id,
          Owner_Email: store.user.email,
          error: error.message,
        },
      );
    }
  }

  @OnEvent('store.banned')
  handleStoreBannedEvent(payload: StoreBanEvent) {
    const { store, reason } = payload;

    try {
      const html = STORE_BANNED_TEMPLATE;
      const mail = {
        to: store.user.email,
        subject: 'Store Ban Notification',
        html: html,
        placeholders: {
          name: store.user.firstName,
          storeName: store.name,
          reason: reason,
          policyLink: 'https://yourapp.com/terms',
          supportLink: 'https://support.yourapp.com',
          year: new Date().getFullYear().toString(),
        },
      };
      this.mailService.sendMail(mail).catch((error) => {
        this.activityLogService.error(
          'Failed to send store Disapproval email',
          'Admin/StoreApproveEvent',
          store.user.email,
          store.user.role,
          { StoreId: store.id, error: error.message },
        );
      });
    } catch (error) {
      this.activityLogService.error(
        'Failed to handle store Ban event',
        'Admin/StoreBanEvent',
        store.user.email,
        store.user.role,
        {
          StoreId: store.id,
          Owner_Email: store.user.email,
          error: error.message,
        },
      );
    }
  }
}
