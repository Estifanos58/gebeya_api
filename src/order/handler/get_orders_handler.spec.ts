import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { GetOrdersHandler } from "./get_orders.handler";
import { Repository } from "typeorm";
import { Order, OrderStatus } from "@/entities";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GetOrdersQuery } from "../query/get_orders.query";

jest.mock('@/utils/InternalServerError', ()=>({
    logAndThrowInternalServerError: jest.fn()
}))

describe('GetOrderHandler', ()=>{
    let handler: GetOrdersHandler
    let orderRepo: jest.Mocked<Repository<Order>>
    let activityLogService: ActivityLogService

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetOrdersHandler,
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

        handler = module.get<GetOrdersHandler>(GetOrdersHandler)
        orderRepo = module.get(getRepositoryToken(Order))
        activityLogService = module.get<ActivityLogService>(ActivityLogService)
    })

    it('should get orders', async ()=>{
        const mockOrder = {id: '1'} as Order
        const query = { userId: '1', status:OrderStatus.PLACED} as GetOrdersQuery

        jest.spyOn(orderRepo, 'find').mockResolvedValue([mockOrder])

        const result = await handler.execute(query);

        expect(orderRepo.find).toHaveBeenCalledWith({
            where: {user: {id: query.userId}, status: query.status},
             relations: ['items', 'items.productSkus'],
        })
        expect(result).toEqual({
             message: 'Orders retrieved successfully',
             data: [mockOrder]
        })
    })

    it('should throw Error', async ()=>{
         const query = { userId: '1', status:OrderStatus.PLACED} as GetOrdersQuery

         jest.spyOn(orderRepo, 'find').mockResolvedValue([])

         await handler.execute(query);

        expect(orderRepo.find).toHaveBeenCalledWith({
            where: {user: {id: query.userId}, status: query.status},
             relations: ['items', 'items.productSkus'],
        })
        expect(logAndThrowInternalServerError).toHaveBeenCalled()
    })
})