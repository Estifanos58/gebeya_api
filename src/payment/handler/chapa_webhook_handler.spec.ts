import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { ChapaWebhookHandler } from "./chapa_webhook_handler";
import { Order, Payment, PaymentStatus, User, UserRole } from "@/entities";
import { Repository } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ChapaWebhookCommand } from "../command/chapa_webhook_command";

jest.mock('@/utils/InternalServerError', ()=>({
    logAndThrowInternalServerError:  jest.fn()
}))

describe('ChapaWebhookHandler', () => {
    let handler: ChapaWebhookHandler;
    let paymentRepo: jest.Mocked<Repository<Payment>>;
    let orderRepository: jest.Mocked<Repository<Order>>;
    let eventEmitter: EventEmitter2;
    let activityLogService: ActivityLogService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ChapaWebhookHandler,
                {
                    provide: getRepositoryToken(Payment),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Order),
                    useValue: {
                        findOne: jest.fn(),
                        update: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: EventEmitter2,
                    useValue: {
                        emit: jest.fn(),
                    },
                },
                {
                    provide: ActivityLogService,
                    useValue: {
                        info: jest.fn(),
                        warn: jest.fn(),
                    },
                },
            ],
        }).compile()

        handler = module.get<ChapaWebhookHandler>(ChapaWebhookHandler);
        paymentRepo = module.get(getRepositoryToken(Payment));
        orderRepository = module.get(getRepositoryToken(Order));
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
        activityLogService = module.get<ActivityLogService>(ActivityLogService);
    })

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should handle successful payment', async () => {
        const command = { tx_ref: 'tx_ref_1234', status: 'success' } as ChapaWebhookCommand;

        const mockPayment = {
            id: 'payment_1',
            user:{
                id:'user_id_1',
                email: 'test@gmail.com',
                role: UserRole.CUSTOMER,
            },
            amount: 100,
            currency: 'ETB',
            createdAt: new Date(),
            reference: command.tx_ref,
            status: PaymentStatus.PENDING,
        } as Payment
        jest.spyOn(paymentRepo, 'findOne').mockResolvedValue(mockPayment);
        jest.spyOn(orderRepository, 'update').mockResolvedValue({ affected: 1, raw: 2, generatedMaps: [] });
        const result = await handler.execute(command);

        expect(paymentRepo.findOne).toHaveBeenCalledWith({
            where: { reference: command.tx_ref },
            relations: ['user'],
        });
        expect(activityLogService.info).toHaveBeenCalledWith(
            'Chapa Payment Successful',
            'ChapaWebhookHandler',
            expect.any(String),
            expect.any(String), 
            expect.any(Object)
        )
        expect(eventEmitter.emit).toHaveBeenCalledWith('payment.success', expect.any(Object));
    })

    it('should handle failed payment', async () => {
        const command = { tx_ref: 'tx_ref_1234', status: 'failed' } as ChapaWebhookCommand;

        
        const mockPayment = {
            id: 'payment_1',
            user:{
                id:'user_id_1',
                email: 'test@gmail.com',
                role: UserRole.CUSTOMER,
            },
            amount: 100,
            currency: 'ETB',
            createdAt: new Date(),
            reference: command.tx_ref,
            status: PaymentStatus.PENDING,
        } as Payment
        jest.spyOn(paymentRepo, 'findOne').mockResolvedValue(mockPayment);
        const result = await handler.execute(command);

        expect(paymentRepo.findOne).toHaveBeenCalledWith({
            where: { reference: command.tx_ref },
            relations: ['user'],
        });
        expect(activityLogService.warn).toHaveBeenCalledWith(
            'Chapa Payment Failed',
            'ChapaWebhookHandler',
            expect.any(String),
            expect.any(String), 
            expect.any(Object)
        )
        expect(eventEmitter.emit).not.toHaveBeenCalled();
        
    })
})