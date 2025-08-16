import { Repository } from 'typeorm';
import { GetCartHandler } from './get-cart.handler';
import { Cart } from '@/entities';
import { ActivityLogService } from '@/log/activityLog.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GetCartQuery } from '../query/get-cart.query';
import { NotFoundException } from '@nestjs/common';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));

describe('GetCartHandler', () => {
  let handler: GetCartHandler;
  let cartRepository: jest.Mocked<Repository<Cart>>;
  let activityLogService: ActivityLogService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GetCartHandler,
        {
          provide: getRepositoryToken(Cart),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ActivityLogService,
          useValue: {
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetCartHandler>(GetCartHandler);
    cartRepository = module.get(getRepositoryToken(Cart));
    activityLogService = module.get(ActivityLogService);
  });

  it('should retrieve cart successfully', async () => {
    const query = { userId: 'userId' } as GetCartQuery;
    const mockCart = { id: 'cartId', user: { id: 'userId' } } as Cart;

    jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart);

    const result = await handler.execute(query);

    expect(cartRepository.findOne).toHaveBeenCalledWith({
      where: { user: { id: query.userId } },
      relations: ['cartItems', 'cartItems.productSku', 'user'],
    });
    expect(result).toEqual({
      message: 'Cart retrieved successfully',
      data: mockCart,
    });
  });

  it('should throw NotFoundException if cart does not exist', async () => {
    const query = { userId: 'userId' } as GetCartQuery;

    jest.spyOn(cartRepository, 'findOne').mockResolvedValue(null);

    await handler.execute(query);
    expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
      expect.any(NotFoundException),
      'GetCartHandler',
      'Cart/Retrieval',
      activityLogService,
      expect.any(Object),
    );
  });
});
