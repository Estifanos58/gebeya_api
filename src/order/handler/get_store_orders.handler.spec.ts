import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { GetStoreOrdersHandler } from "./get_store_orders.handler";
import { Repository } from "typeorm";
import { Order, OrderStatus } from "@/entities";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GetStoreOrdersQuery } from "../query/get_store_orders.query";

jest.mock('@/utils/InternalServerError', ()=>({
    logAndThrowInternalServerError: jest.fn()
}))

describe('GetOrdersHandler', ()=>{
    let handler: GetStoreOrdersHandler
    let orderRepo: jest.Mocked<Repository<Order>>
    let activityLogService: ActivityLogService

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetStoreOrdersHandler,
                {
                    provide: getRepositoryToken(Order),
                    useValue: {
                        find: jest.fn()
                    }
                },
                {
                    provide: ActivityLogService,
                    useValue: {}
                }
            ]
        }).compile()

        handler = module.get<GetStoreOrdersHandler>(GetStoreOrdersHandler)
        orderRepo = module.get(getRepositoryToken(Order))
        activityLogService = module.get<ActivityLogService>(ActivityLogService)
    })

    it('should return the order', async ()=>{
        const query = {
            userId: 'user_id_1',
            storeId: 'store_id_1',
            status: OrderStatus.PLACED
        } as GetStoreOrdersQuery

        const mockedOrder = { id: '1'} as Order

        jest.spyOn(orderRepo, 'find').mockResolvedValue([mockedOrder])

        const result = await handler.execute(query);

        expect(orderRepo.find).toHaveBeenCalledWith({
            where: { store: {id: query.storeId, user: {id: query.userId} }, status: query.status},
            relations: ['items', 'items.productSkus', 'store', 'store.user']
        })
        expect(result).toEqual({
            message: 'Store Orders retrieved successfully',
            data: [mockedOrder]
        })
    })
})