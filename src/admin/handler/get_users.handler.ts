import { CommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from '../query/get_users.query';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entities';
import { Repository } from 'typeorm';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';
import { ActivityLogService } from '@/log/activityLog.service';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(query: GetUsersQuery): Promise<any> {
    const { search, role, status, order, banned, page, limit } = query;

    try {
      const pageNumber = page && page > 0 ? page : 1;
      const pageSize = limit && limit > 0 ? limit : 10;
      const skip = (pageNumber - 1) * pageSize;

      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .where('1=1');

      if (search) {
        queryBuilder.andWhere(
          'user.firstName ILIKE :search OR user.lastName ILIKE :search',
          { search: `%${search}%` },
        );
      }
      if (role) {
        queryBuilder.andWhere('user.role = :role', { role });
      }
      if (status) {
        queryBuilder.andWhere('user.isActive = :status', { status });
      }
      if (banned !== null) {
        queryBuilder.andWhere('user.banned = :banned', { banned });
      }

      const orderBy = order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      queryBuilder.orderBy('user.createdAt', orderBy);
      queryBuilder.skip(skip).take(pageSize);

      const [users, total] = await queryBuilder.getManyAndCount();

      return {
        message: 'Users retrieved successfully',
        data: users,
        total,
        page: pageNumber,
        limit: pageSize,
      };
    } catch (error) {
      logAndThrowInternalServerError(
        error,
        'GetUsersHandler',
        'Admin/Users/Retrieval',
        this.activityLogService,
      );
    }
  }
}
