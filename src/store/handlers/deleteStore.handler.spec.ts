import { ActivityLogService } from "@/log/activityLog.service";
import { DeleteStoreHandler } from "./deleteStore.handler"
import { Repository } from "typeorm";
import { Store } from "@/entities";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DeleteStoreCommand } from "../command/deleteStore.command";
import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { HttpException } from "@nestjs/common";

jest.mock('@/utils/InternalServerError', () => ({
    logAndThrowInternalServerError: jest.fn()
}))

describe('DeleteStoreHandler', () => {
    let handler: DeleteStoreHandler;
    let storeRepo: jest.Mocked<Repository<Store>>;
    let activityLogService: ActivityLogService;

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteStoreHandler,
                {
                    provide: getRepositoryToken(Store),
                    useValue: {
                        findOne: jest.fn(),
                        delete: jest.fn(),
                    }
                },
                {
                    provide: ActivityLogService,
                    useValue: {
                        info: jest.fn(),
                    }
                }
            ]
        }).compile()

        handler = module.get<DeleteStoreHandler>(DeleteStoreHandler);
        storeRepo = module.get(getRepositoryToken(Store));
        activityLogService  = module.get<ActivityLogService>(ActivityLogService)
    })

    it('shoudl be defined', () => {
        expect(handler).toBeDefined()
    })

    it('should delete a store successfully', async () => {
        // Arrange
        const command = { user: { id: 'userId', email: 'test@gmail.com'}, id: 'storeId'} as DeleteStoreCommand;
        const mockStore = { id: 'storeId', user: { id: 'userId' } } as Store;
        jest.spyOn(storeRepo, 'findOne').mockResolvedValueOnce(mockStore);
        jest.spyOn(storeRepo, 'delete').mockResolvedValueOnce({ affected: 1, raw: 2});

        // Act
        const result = await handler.execute(command);
        expect(result).toEqual({
            message: 'Store deleted successfully',
        })
        expect(storeRepo.findOne).toHaveBeenCalledWith({
            where: { id: mockStore.id, user: command.user },
            relations: ['user'],
        })
        expect(storeRepo.delete).toHaveBeenCalledWith({ id: command.id });
        expect(activityLogService.info).toHaveBeenCalled()

    })

    it('should throw an error if store not found', async () => {
        // Arrange
        const command = { user: { id: 'userId', email: 'test@gmail.com'}, id: 'storeId_1'} as DeleteStoreCommand
        jest.spyOn(storeRepo, 'findOne').mockResolvedValueOnce(null);
        
        //Act
        await handler.execute(command as DeleteStoreCommand)

        expect(storeRepo.findOne).toHaveBeenCalledWith({
            where: { id: command.id, user: command.user },
            relations: ['user'],
        })
        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(HttpException),
            'DeleteStoreHandler',
            'Delete Store Command',
            activityLogService,
            expect.any(Object)
           
        )
    })
})