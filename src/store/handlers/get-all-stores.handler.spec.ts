import { createQueryBuilder, Repository } from "typeorm";
import { GetAllStoreHandler } from "./get-all-stores.handler";
import { Store } from "@/entities";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GetAllStoreQuery } from "../query/get-all-stores.query";

jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));

describe('GetAllStoreHandler', () => {
    let handler: GetAllStoreHandler;
    let storeRepo: jest.Mocked<Repository<Store>>;
    let activityLogService: ActivityLogService;

    beforeEach(async()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetAllStoreHandler,
                {
                    provide: getRepositoryToken(Store),
                    useValue: {
                        createQueryBuilder: jest.fn().mockReturnThis()
                    }
                },
                {
                    provide: ActivityLogService,
                    useValue: {}
                }
            ]
        }).compile()

        handler = module.get<GetAllStoreHandler>(GetAllStoreHandler);
        storeRepo = module.get(getRepositoryToken(Store));
        activityLogService = module.get<ActivityLogService>(ActivityLogService);
    })

     const generateMockQb = ()=>{
            const qb: any = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn(),
            }
            jest.spyOn(storeRepo, 'createQueryBuilder').mockReturnValue(qb);
            return qb;
        }

    it('should return all stores with default pagination', async () => {
        const qb = generateMockQb();
        const query = {} as GetAllStoreQuery;
        const mockedStore = {
            id: 'storeId1',
            name: 'Test Store',
            user: { id: '1', username: 'testuser' },
            product: [],
            comment: [],
            location: 'Test Location',
            phoneNumber: '1234567890',
            isVerified: true,
            banned: false,
            payments: [],
            orders: [],
            createdAt: new Date(),
        }
        qb.getMany.mockResolvedValue([mockedStore]);

        const result = await handler.execute(query)

        expect(result).toEqual({
            message: "Returns all stores",
            data: [mockedStore]
        });
        expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('store.user', 'user');
        expect(qb.getMany).toHaveBeenCalled();
    })

    it('should filter stores by name', async () => {
        const qb = generateMockQb();
        const query = { name: 'Test Store' } as GetAllStoreQuery;
        const mockedStore = {
            id: 'storeId1',
            name: 'Test Store',
            user: { id: '1', username: 'testuser' },
            product: [],
            comment: [],
            location: 'Test Location',
            phoneNumber: '1234567890',
            isVerified: true,
            banned: false,
            payments: [],
            orders: [],
            createdAt: new Date(),
        }
        qb.getMany.mockResolvedValue([mockedStore]);

        await handler.execute(query);
        expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('store.user', 'user');
        expect(qb.where).toHaveBeenCalledWith('store.name ILIKE :name', { name: `%${query.name}%` });
    })

    it('should filter stores by isVerified', async () => {
        const qb = generateMockQb();
        const query = { isVerified: true } as GetAllStoreQuery;
        const mockedStore = {
            id: 'storeId1',
            name: 'Test Store',
            user: { id: '1', username: 'testuser' },
            product: [],
            comment: [],
            location: 'Test Location',
            phoneNumber: '1234567890',
            isVerified: true,
            banned: false,
            payments: [],
            orders: [],
            createdAt: new Date(),
        }
        qb.getMany.mockResolvedValue([mockedStore]);

        await handler.execute(query);
        expect(qb.andWhere).toHaveBeenCalledWith('store.isVerified = :isVerified', { isVerified: query.isVerified });
    })

    it('should filter stores by banned status', async () => {
        const qb = generateMockQb();
        const query = { banned: true } as GetAllStoreQuery;
        const mockedStore = {
            id: 'storeId1',
            name: 'Test Store',
            user: { id: '1', username: 'testuser' },
            product: [],
            comment: [],
            location: 'Test Location',
            phoneNumber: '1234567890',
            isVerified: true,
            banned: true,
            payments: [],
            orders: [],
            createdAt: new Date(),
        }
        qb.getMany.mockResolvedValue([mockedStore]);

        await handler.execute(query);
        expect(qb.andWhere).toHaveBeenCalledWith('store.banned = :banned', { banned: query.banned });
    })
})