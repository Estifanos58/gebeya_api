import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { StoreController } from "./store.controller"
import { Test, TestingModule } from "@nestjs/testing";
import { Request } from "express";

describe('StoreController', () => {
    let controller: StoreController;
    let commandBus: CommandBus;
    let queryBus: QueryBus;

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StoreController],
            providers: [
                {
                    provide: CommandBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
                {
                    provide: QueryBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                }
            ]
        }).compile()

        controller = module.get<StoreController>(StoreController);
        commandBus = module.get<CommandBus>(CommandBus);
        queryBus = module.get<QueryBus>(QueryBus);
    })

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a store', async () => {
        const createStoreDto = {
            storeName: 'Test Store',
            location: 'Test Location',
            phoneNumber: '1234567890',
        };
        const req = { userId: 'testUserId' } as unknown as Request;

        jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({});

        const result = await controller.createStore(createStoreDto, req);
        expect(result).toEqual({});
        expect(commandBus.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                createdBy: req.userId,
                storeName: createStoreDto.storeName,
                location: createStoreDto.location,
                phoneNumber: createStoreDto.phoneNumber,
            })
        );
    });

    it('should return all stores', async () => {
        const mockStores = [{ id: '1', name: 'Store 1' }, { id: '2', name: 'Store 2' }];
        jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(mockStores);

        const result = await controller.findAll();
        expect(result).toEqual(mockStores);
        expect(queryBus.execute).toHaveBeenCalledWith(expect.anything());
    });

    it('should return a specific store by ID', async () => {
        const storeId = '1';
        const mockStore = { id: '1', name: 'Store 1' };
        jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(mockStore);

        const result = await controller.findOne(storeId);
        expect(result).toEqual(mockStore);
        expect(queryBus.execute).toHaveBeenCalledWith(expect.anything());
    });

    it('should delete a store', async () => {
        const storeId = '1';
        const req = { user: { id: 'testUserId' } } as unknown as Request;

        jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({});

        const result = await controller.deleteStore(storeId, req);
        expect(result).toEqual({});
        expect(commandBus.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                id: storeId,
                user: req.user,
            })
        );
    });
})