// log/activity-log.service.ts

import { ActivityLog, ActivityType } from '@/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly logRepo: Repository<ActivityLog>,
  ) {}

  async log(
    type: ActivityType,
    message: string,
    context?: string,
    actorId?: string,
    actorRole?: string,
    metadata?: Record<string, any>,
  ) {
    await this.logRepo.save({
      type,
      message,
      context,
      actorId,
      actorRole,
      metadata,
    });
  }

  async info(
    message: string,
    context?: string,
    actorId?: string,
    actorRole?: string,
    metadata?: any,
  ) {
    return this.log(
      ActivityType.INFO,
      message,
      context,
      actorId,
      actorRole,
      metadata,
    );
  }

  async warn(
    message: string,
    context?: string,
    actorId?: string,
    actorRole?: string,
    metadata?: any,
  ) {
    return this.log(
      ActivityType.WARNING,
      message,
      context,
      actorId,
      actorRole,
      metadata,
    );
  }

  async error(
    message: string,
    context?: string,
    actorId?: string,
    actorRole?: string,
    metadata?: any,
  ) {
    return this.log(
      ActivityType.ERROR,
      message,
      context,
      actorId,
      actorRole,
      metadata,
    );
  }
}
