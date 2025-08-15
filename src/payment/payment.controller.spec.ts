import { CommandBus } from "@nestjs/cqrs"
import { PaymentController } from "./payment.controller"
import { Test, TestingModule } from "@nestjs/testing"

describe('PaymentController', () => {
    let controller: PaymentController
    let commandBus: CommandBus

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentController],
            providers: [
                {
                    provide: CommandBus,
                    useValue: {
                        execute: jest.fn()
                    }
                }
            ]
        }).compile()
        controller = module.get<PaymentController>(PaymentController)
        commandBus = module.get<CommandBus>(CommandBus)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    it('should initialize payment', async () => {
        const body = { storeId: 'store_1', orderId: 'order_1' }
        const req = { user: { id: 'user_1' } } as any
        
        await controller.initializePayment(body, req)

        expect(commandBus.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                storeId: body.storeId,
                orderId: body.orderId,
                user: req.user
            })
        )
    })

    it('should handle webhook', async () => {
        const req = { body: { tx_ref: 'tx_123', status: 'success' } } as any
        
        await controller.handleWebhook(req)

        expect(commandBus.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                tx_ref: req.body.tx_ref,
                status: req.body.status
            })
        )
    })

    it('should verify payment', async () => {
        const body = { tx_ref: 'tx_123' }
        
        await controller.verifyPayment(body)

        expect(commandBus.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                tx_ref: body.tx_ref
            })
        )
    })
})