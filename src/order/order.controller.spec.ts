import { CommandBus } from "@nestjs/cqrs";
import { OrderController } from "./order.controller";
import { Test, TestingModule } from "@nestjs/testing";
import { OrderStatus } from "@/entities";

describe('OrderController', () => {
    let controller: OrderController;
    let commandBus: CommandBus;
    
    beforeEach(async() => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrderController],
            providers: [
                {
                    provide: CommandBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
            ],
        }).compile()

        controller = module.get<OrderController>(OrderController);
        commandBus = module.get<CommandBus>(CommandBus);
    });
    
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    
    it('should create an order', async () => {
        const createOrderDto = {
            cartId: 'cart123',
            deliveryAddress: '123 Street',
            contactInfo: '1234567890',
        };
        const req = { userId: 'user123' };

        jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({ orderId: 'order123' });
        const result = await controller.createOrder(createOrderDto, req as any);
        
        expect(commandBus.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                cartId: createOrderDto.cartId,
                deliveryAddress: createOrderDto.deliveryAddress,
                contactInfo: createOrderDto.contactInfo,
            })
        );
        expect(result).toEqual({ orderId: 'order123' });
    });

    it('should get orders', async () => {
        const req = { userId: 'user123' };
        const status = OrderStatus.PLACED;
        jest.spyOn(commandBus, 'execute').mockResolvedValueOnce([{ orderId: 'order123' }]);
        const result = await controller.getOrders(status, req as any);
        expect(commandBus.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: req.userId,
                status: status,
            })
        );
        expect(result).toEqual([{ orderId: 'order123' }]);
    });

    it('should get store orders', async () => {
        const req = { userId: 'user123' };
        const storeId = 'store123';
        const status = undefined;
        jest.spyOn(commandBus, 'execute').mockResolvedValueOnce([{ orderId: 'order123' }]);
        
        const result = await controller.getStoreOrder(storeId, status, req as any);
        
        expect(commandBus.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: req.userId,
                storeId: storeId,
                status: status,
            })
        );
        expect(result).toEqual([{ orderId: 'order123' }]);
    });
})