import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { CreateStoreHandler } from "./createStore.handler";
import { Store, User, UserRole } from "@/entities";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateStoreCommand } from "../command/createStore.command";
import { Repository } from "typeorm";
import { HttpException } from "@nestjs/common";

jest.mock('@/utils/InternalServerError', () => ({
    logAndThrowInternalServerError: jest.fn()
}))

describe('CreateStoreHandler', () => {
    let handler: CreateStoreHandler;
    let userRepo: jest.Mocked<Repository<User>>;
    let storeRepo: jest.Mocked<Repository<Store>>;
    let activityLogService: ActivityLogService;

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateStoreHandler,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(Store),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
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

        handler = module.get<CreateStoreHandler>(CreateStoreHandler);
        userRepo = module.get(getRepositoryToken(User));
        storeRepo = module.get(getRepositoryToken(Store));
        activityLogService = module.get<ActivityLogService>(ActivityLogService);
    })

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should create a store successfully', async () => {
        const command = {createdBy: 'Test Store', storeName: 'Test Store', location: 'Test Location', phoneNumber: '1234567890'} as CreateStoreCommand;
        const mockuser = { id: 'userId', role: UserRole.MERCHANT } as User;
        const mockstore = { id: 'storeId', name: 'Test Store' } as Store;

        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(mockuser);
        jest.spyOn(storeRepo, 'findOne').mockResolvedValueOnce(null);
        jest.spyOn(storeRepo, 'create').mockReturnValueOnce(mockstore);
        jest.spyOn(storeRepo, 'save').mockResolvedValueOnce(mockstore);

        const result = await handler.execute(command);
        expect(result).toEqual({
            message: 'Store created successfully',
            data: mockstore,
        });
        expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: command.createdBy } });
        expect(activityLogService.info).toHaveBeenCalled()
        expect(storeRepo.create).toHaveBeenCalledWith({
            name: command.storeName,
            location: command.location,
            phoneNumber: command.phoneNumber,
            user: mockuser,
        });
        expect(storeRepo.save).toHaveBeenCalledWith(mockstore);
    });

    it('should throw an error if user not found', async () => {
        const command = new CreateStoreCommand('userId', 'Test Store', 'Test Location', '1234567890');

        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(null);

        await handler.execute(command)
        expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: command.createdBy } });
        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(HttpException),
            'CreateStoreHandler',
            'Create Store Command',
            activityLogService,
            expect.any(Object)
        );
    });

    it('should throw an error if user is not a Merchant', async () => {
        const command = new CreateStoreCommand('userId', 'Test Store', 'Test Location', '1234567890');
        const mockuser = { id: 'userId', role: UserRole.ADMIN } as User;

        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(mockuser);

        await handler.execute(command)
        expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: command.createdBy } });
        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(HttpException),
            'CreateStoreHandler',
            'Create Store Command',
            activityLogService,
            expect.any(Object)
        );
    });

    it('should throw an error if merchant already owns a store', async () => {
        const command = new CreateStoreCommand('userId', 'Test Store', 'Test Location', '1234567890');
        const mockuser = { id: 'userId', role: UserRole.MERCHANT } as User;
        const existingStore = { id: 'existingStoreId' } as Store;

        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(mockuser);
        jest.spyOn(storeRepo, 'findOne').mockResolvedValueOnce(existingStore);

        await handler.execute(command)
        expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: command.createdBy } });
        expect(storeRepo.findOne).toHaveBeenCalledWith({ where: { user: { id: mockuser.id } } });
        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(HttpException),
            'CreateStoreHandler',
            'Create Store Command',
            activityLogService,
            expect.any(Object)
        );
    });
})