import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActivitiesQuery } from '../query/get_activities.query';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityLog, ActivityType } from '@/entities';
import { FindOptionsWhere, Repository } from 'typeorm';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';
import { ActivityLogService } from '@/log/activityLog.service';

@QueryHandler(GetActivitiesQuery)
export class GetActivitiesHandler implements IQueryHandler<GetActivitiesQuery> {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(query: GetActivitiesQuery): Promise<any> {
    const { error, info, warning, page, limit } = query;

    try {
      const pageNumber = page && page > 0 ? page : 1;
      const pageSize = limit && limit > 0 ? limit : 10;
      const skip = (pageNumber - 1) * pageSize;

      const whereOptions: FindOptionsWhere<ActivityLog> = {}

      if(error) {
            whereOptions.type = ActivityType.ERROR
      } else if(info){
            whereOptions.type = ActivityType.INFO
      } else if(warning) {
        whereOptions.type = ActivityType.WARNING
      }

      const [activities, totalCount] = await this.activityLogRepository.findAndCount({
        where: whereOptions,
        skip,
        take: pageSize
      })

      return {
        message: "Activities retrievied successfully",
        data: activities,
        totalCount,
        page: pageNumber,
        limit: pageSize
      }


    } catch (error) {
      logAndThrowInternalServerError(
        error,
        'GetActivitiesHandler',
        'Admin/Activities',
        this.activityLogService,
      );
    }
  }
}
