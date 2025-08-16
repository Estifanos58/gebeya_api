import { Store } from "@/entities";
import { GetStoreHandler } from "./get-store.handler";
import { Repository } from "typeorm";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { logAndThrowInternalServerError } from "@/utils/InternalServerError";

jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));

describe('GetStoreHandler', () => {
    let handler: GetStoreHandler;
    let storeRepo: jest.Mocked<Repository<Store>>;
    let activityLogService: ActivityLogService;

    beforeEach(async ()=>{
        const module = await Test.createTestingModule({
            providers: [
                GetStoreHandler,
                {
                    provide: getRepositoryToken(Store),
                    useValue: {
                        findOne: jest.fn(),
                    }
                },
                {
                    provide: ActivityLogService,
                    useValue: {}
                }
            ]
        }).compile();

        handler = module.get<GetStoreHandler>(GetStoreHandler);
        storeRepo = module.get(getRepositoryToken(Store));
        activityLogService = module.get<ActivityLogService>(ActivityLogService);
    })

    it('should return a specific store by ID', async () => {
        const storeId = 'storeId1';
        const query = { storeId } as any;
        const mockedStore = {
            id: storeId,
            name: 'Test Store',
            user: { id: '1', username: 'testuser' },
            product: [],
            comment: [],
        } as unknown as Store;

        jest.spyOn(storeRepo, 'findOne').mockResolvedValue(mockedStore);

        const result = await handler.execute(query);

        expect(result).toEqual({
            message: 'Returns a specific store by ID',
            data: mockedStore,
        });
        expect(storeRepo.findOne).toHaveBeenCalledWith({
            where: { id: storeId },
            relations: [
                'user',
                'product',
                'product.skus',
                'product.category',
                'comment',
                'comment.user',
            ],
        });
    });

    it('should throw an error if store not found', async () => {
        const storeId = 'storeId1';
        const query = { storeId } as any;

        jest.spyOn(storeRepo, 'findOne').mockResolvedValue(null);

        await handler.execute(query);

        expect(logAndThrowInternalServerError).toHaveBeenCalled()
    });
})