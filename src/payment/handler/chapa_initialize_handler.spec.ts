import { ChapaInitializePaymentCommand } from '../command/chapa_initialize_commannd';
import { generateReference } from '@/utils/generalFunctions';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { Store, Order, Payment, User } from '@/entities';
import { Repository } from 'typeorm';
import { ActivityLogService } from '@/log/activityLog.service';
import { ChapaInitializePaymentHandler } from './chapa_initialize_handler';

jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));
jest.mock('@/utils/generalFunctions', () => ({
  generateReference: jest.fn().mockReturnValue('tx_ref_12345'),
}));

describe('ChapaInitializePaymentHandler', () => {
  let handler: ChapaInitializePaymentHandler;
  let storeRepository: Repository<Store>;
  let orderRepository: Repository<Order>;
  let paymentRepository: Repository<Payment>;
  let httpService: HttpService;
  let configService: ConfigService;
  let activityLogService: ActivityLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChapaInitializePaymentHandler,
        {
          provide: getRepositoryToken(Store),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'CHAPA_SECRET_KEY':
                  return 'fake-secret';
                case 'CHAPA_INITIALIZER':
                  return 'https://fake-chapa.com/init';
                case 'BASE_URL':
                  return 'https://backend.com';
                case 'FRONTEND_URL':
                  return 'https://frontend.com';
                default:
                  return '';
              }
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              post: jest.fn(), // mock axiosRef.post
            },
          },
        },
        {
          provide: ActivityLogService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    httpService = module.get(HttpService);
    handler = module.get<ChapaInitializePaymentHandler>(
      ChapaInitializePaymentHandler,
    );
    storeRepository = module.get(getRepositoryToken(Store));
    orderRepository = module.get(getRepositoryToken(Order));
    paymentRepository = module.get(getRepositoryToken(Payment));
    configService = module.get(ConfigService);
    httpService = module.get(HttpService);
    activityLogService = module.get(ActivityLogService);
  });

  it('should initialize payment successfully', async () => {
    // Arrange
    jest.spyOn(storeRepository, 'findOne').mockResolvedValue({
      id: 'store1',
      user: {id: 'userId_1'} as User,
    } as Store);

    jest.spyOn(orderRepository, 'findOne').mockResolvedValue({
      id: 'order1',
      total: 100,
      items: [],
    } as unknown as Order);
    jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(paymentRepository, 'create').mockReturnValue({} as Payment);
    jest.spyOn(paymentRepository, 'save').mockResolvedValue({} as Payment);

    // Mock axiosRef.post response
    jest
      .spyOn(httpService.axiosRef, 'post')
      .mockResolvedValue({
        data: {
          data: {
            checkout_url: 'https://checkout.chapa.com/tx_ref=12345',
          },
        },
      })

    const command = {
      user: {
        id: 'u1',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '12345',
      },
      storeId: 'store1',
      orderId: 'order1',
    } as ChapaInitializePaymentCommand;

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result).toEqual({
      message: 'Payment initialization successful',
      checkout_url: 'https://checkout.chapa.com/tx_ref=12345',
      reference: expect.any(String),
    });
    expect(httpService.axiosRef.post).toHaveBeenCalledWith(
      'https://fake-chapa.com/init',
      expect.any(Object),
      expect.objectContaining({
        headers: { Authorization: 'Bearer fake-secret' },
      }),
    );

    expect(storeRepository.findOne).toHaveBeenCalledWith({
      where: { id: command.storeId },
      relations: ['user'],
    });
    expect(orderRepository.findOne).toHaveBeenCalledWith({
      where: { id: command.orderId, user: { id: command.user.id } },
      relations: ['items', 'items.productSkus'],
    });
    expect(paymentRepository.findOne).toHaveBeenCalledWith({
      where: { order: { id: command.orderId } },
    });
    expect(configService.get).toHaveBeenCalledTimes(4);
    expect(generateReference).toHaveBeenCalled();
    expect(httpService.axiosRef.post).toHaveBeenCalled();
    expect(paymentRepository.create).toHaveBeenCalled();
    expect(paymentRepository.save).toHaveBeenCalled();
  });
});
