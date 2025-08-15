import { Repository } from 'typeorm';
import { ChapaVerifyHandler } from './chapa_verify_handler';
import { Order, Payment, PaymentStatus, Product, User } from '@/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ActivityLogService } from '@/log/activityLog.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChapaVerifyCommand } from '../command/chapa_verify_command';

jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));

describe('ChapaVerifyHandler', () => {
  let handler: ChapaVerifyHandler;
  let paymentRepository: jest.Mocked<Repository<Payment>>;
  let orderRepository: jest.Mocked<Repository<Order>>;
  let eventEmitter: EventEmitter2;
  let httpService: HttpService;
  let configService: ConfigService;
  let activityLogService: ActivityLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChapaVerifyHandler,
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
          provide: HttpService,
          useValue: {
            axiosRef: {
              get: jest.fn(),
            },
          },
        },
        {
          provide: ActivityLogService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'CHAPA_VERIFY_URL':
                  return 'https://fake-chapa.com/verify';
                case 'CHAPA_SECRET_KEY':
                  return 'fake_secretKey';
                default:
                  return '';
              }
            }),
          },
        },
      ],
    }).compile();

      httpService = module.get(HttpService);
        handler = module.get<ChapaVerifyHandler>(
          ChapaVerifyHandler,
        );
        orderRepository = module.get(getRepositoryToken(Order));
        paymentRepository = module.get(getRepositoryToken(Payment));
        eventEmitter = module.get(EventEmitter2);
        configService = module.get(ConfigService);
        httpService = module.get(HttpService);
        activityLogService = module.get(ActivityLogService);
  });

  it('should be defined', ()=>{
    expect(handler).toBeDefined()
  })

  it('should Verify and emit an Event', async ()=>{
    const command = {tx_ref: 'tx_ref_1234'} as ChapaVerifyCommand;
    const mockPayment = {
        id: 'paymentId_1',
        user: {
            id: 'userId_1'
        } as User,
        status: PaymentStatus.PENDING
    } as Payment;
    const mockResponse = {
        status: 200,
        data: {
            status: 'success'
        }
    }
    const mockOrder = {
        id: 'orderId_1',
        isPaid: false
    } as Order;
    jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(mockPayment);
    jest.spyOn(httpService.axiosRef, 'get').mockResolvedValue(mockResponse);
    jest.spyOn(orderRepository, 'findOne').mockResolvedValue(mockOrder)
    jest.spyOn(orderRepository, 'save').mockResolvedValue({} as Order)
    jest.spyOn(paymentRepository, 'save').mockResolvedValue({} as Payment)

    const result = await handler.execute(command);

    expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { reference: command.tx_ref},
        relations: ['user'],
    })
    expect(httpService.axiosRef.get).toHaveBeenCalled()
    expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { payment: {id: mockPayment.id}}
    })
    expect(eventEmitter.emit).toHaveBeenCalled()
  })
});
