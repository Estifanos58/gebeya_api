import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApproveStoreCommand } from './command/approve_store.command';
import { BanStoreCommand } from './command/ban_store.command';
import { UnBanStoreCommand } from './command/upban_store.command';
import { UserBanCommand } from './command/ban_user.command';
import { UserUnbanCommand } from './command/unban_user.command';
import { GetUsersQuery } from './query/get_users.query';
import { GetStoresQuery, StoreSortQuery } from './query/get_stores.query';
import { GetActivitiesQuery } from './query/get_activities.query';
import { GetActivityByIdQuery } from './query/get_activity_byId.query';
import { UserRole } from '@/entities';

describe('AdminController', () => {
  let controller: AdminController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get(AdminController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  describe('approveStore', () => {
    it('should call ApproveStoreCommand with correct params', async () => {
      const req: any = { user: { id: 'admin1' } };
      const dto = { isApproved: true };
      commandBus.execute.mockResolvedValueOnce('approved');

      const result = await controller.approveStore('store123', dto, req);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new ApproveStoreCommand('store123', true, req.user),
      );
      expect(result).toBe('approved');
    });
  });

  describe('banStore', () => {
    it('should call BanStoreCommand with correct params', async () => {
      const req: any = { user: { id: 'admin1' } };
      const dto = { reason: 'violation' };
      commandBus.execute.mockResolvedValueOnce('banned');

      const result = await controller.banStore('store456', dto, req);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new BanStoreCommand('store456', 'violation', req.user),
      );
      expect(result).toBe('banned');
    });
  });

  describe('unbanStore', () => {
    it('should call UnBanStoreCommand with correct params', async () => {
      const req: any = { user: { id: 'admin1' } };
      commandBus.execute.mockResolvedValueOnce('unbanned');

      const result = await controller.unbanStore('store789', req);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new UnBanStoreCommand('store789', req.user),
      );
      expect(result).toBe('unbanned');
    });
  });

  describe('banUser', () => {
    it('should call UserBanCommand', async () => {
      commandBus.execute.mockResolvedValueOnce('user banned');

      const result = await controller.banUser('user123');

      expect(commandBus.execute).toHaveBeenCalledWith(
        new UserBanCommand('user123'),
      );
      expect(result).toBe('user banned');
    });
  });

  describe('unbanUser', () => {
    it('should call UserUnbanCommand', async () => {
      commandBus.execute.mockResolvedValueOnce('user unbanned');

      const result = await controller.unbanUser('user456');

      expect(commandBus.execute).toHaveBeenCalledWith(
        new UserUnbanCommand('user456'),
      );
      expect(result).toBe('user unbanned');
    });
  });

  describe('getUsers', () => {
    it('should call GetUsersQuery with all params', async () => {
      queryBus.execute.mockResolvedValueOnce('users list');

      const result = await controller.getUsers(
        'john',
        UserRole.ADMIN,
        true,
        'asc',
        false,
        2,
        20,
      );

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetUsersQuery('john', UserRole.ADMIN, true, 'asc', false, 2, 20),
      );
      expect(result).toBe('users list');
    });

    it('should use defaults when params are missing', async () => {
      queryBus.execute.mockResolvedValueOnce('default list');

      const result = await controller.getUsers();

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetUsersQuery(undefined, undefined, undefined, 'desc', undefined, 1, 10),
      );
      expect(result).toBe('default list');
    });
  });

  describe('getStores', () => {
    it('should call GetStoresQuery with all params', async () => {
      queryBus.execute.mockResolvedValueOnce('store list');

      const result = await controller.getStores(
        'electronics',
        true,
        false,
        StoreSortQuery.STORE_CREATED_AT,
        'asc',
        3,
        15,
      );

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetStoresQuery('electronics', true, StoreSortQuery.STORE_CREATED_AT, 'asc', false, 3, 15),
      );
      expect(result).toBe('store list');
    });

    it('should use defaults when params are missing', async () => {
      queryBus.execute.mockResolvedValueOnce('default store list');

      const result = await controller.getStores();

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetStoresQuery('', undefined, StoreSortQuery.STORE_CREATED_AT, 'desc', undefined, 1, 10),
      );
      expect(result).toBe('default store list');
    });
  });

  describe('getActivity', () => {
    it('should call GetActivitiesQuery with all params', async () => {
      queryBus.execute.mockResolvedValueOnce('activity list');

      const result = await controller.getActivity(true, false, true, 4, 25);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetActivitiesQuery(true, false, true, 4, 25),
      );
      expect(result).toBe('activity list');
    });

    it('should use defaults when params are missing', async () => {
      queryBus.execute.mockResolvedValueOnce('default activity list');

      const result = await controller.getActivity();

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetActivitiesQuery(undefined, undefined, undefined, 1, 10),
      );
      expect(result).toBe('default activity list');
    });
  });

  describe('getActivityById', () => {
    it('should call GetActivityByIdQuery', async () => {
      queryBus.execute.mockResolvedValueOnce('activity details');

      const result = await controller.getActivityById('99');

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetActivityByIdQuery('99'),
      );
      expect(result).toBe('activity details');
    });
  });
});
