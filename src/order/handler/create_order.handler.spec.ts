import { Repository } from "typeorm";
import { CreateOrderHandler } from "./create_order.handler";
import { Cart, Order, OrderItem, User } from "@/entities";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateOrderCommand } from "../command/create_order.command";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { calculateCartTotal } from "@/utils/generalFunctions";

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid'),
}));
jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));
jest.mock('@/utils/generalFunctions', () => ({
  calculateCartTotal: jest.fn(() => 100),
}));

describe('CreateOrderHandler', () => {
  let handler: CreateOrderHandler;
  let cartRepo: jest.Mocked<Repository<Cart>>;
  let orderItemRepo: jest.Mocked<Repository<OrderItem>>;
  let orderRepo: jest.Mocked<Repository<Order>>;
  let activityLogService: ActivityLogService;

  const user = { id: '1', address: '123 Street', phoneNumber: '1234567890', email: 'user@mail.com', role: 'customer' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderHandler,
        {
          provide: getRepositoryToken(Cart),
          useValue: { findOne: jest.fn(), delete: jest.fn() },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: { create: jest.fn() },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: { create: jest.fn(), save: jest.fn() },
        },
        {
          provide: ActivityLogService,
          useValue: { info: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<CreateOrderHandler>(CreateOrderHandler);
    cartRepo = module.get(getRepositoryToken(Cart));
    orderItemRepo = module.get(getRepositoryToken(OrderItem));
    orderRepo = module.get(getRepositoryToken(Order));
    activityLogService = module.get<ActivityLogService>(ActivityLogService);
    jest.clearAllMocks();
  });

  function mockCart() {
    return {
      id: 'cartId_1',
      user,
      cartItems: [
        { productSku: { id: '1', price: 50 }, quantity: 2 },
      ],
    } as Cart;
  }

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should create an order successfully', async () => {
    const command = new CreateOrderCommand(user, 'cartId_1', 'Adama', '+251912345678');
    const cart = mockCart();

    cartRepo.findOne.mockResolvedValue(cart);
    orderItemRepo.create.mockReturnValue({} as OrderItem);
    orderRepo.create.mockReturnValue({ store: { id: 'store1' } } as Order);
    orderRepo.save.mockResolvedValue({ id: 'order1', store: { id: 'store1' } } as Order);

    const result = await handler.execute(command);

    expect(cartRepo.findOne).toHaveBeenCalledWith({
      where: { id: command.cartId, user: { id: user.id } },
      relations: ['cartItems', 'cartItems.productSku', 'user'],
    });
    expect(orderItemRepo.create).toHaveBeenCalled();
    expect(orderRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      orderNumber: 'ORD-mocked-uuid',
      deliveryAddress: 'Adama',
      contactInfo: '+251912345678',
    }));
    expect(orderRepo.save).toHaveBeenCalled();
    expect(cartRepo.delete).toHaveBeenCalledWith(cart.id);
    expect(activityLogService.info).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Order created successfully',
      data: { id: 'order1', store: { id: 'store1' } },
    });
  });

  it('should use user address/contact if not provided', async () => {
    const command = new CreateOrderCommand(user, 'cartId_1');
    const cart = mockCart();

    cartRepo.findOne.mockResolvedValue(cart);
    orderItemRepo.create.mockReturnValue({} as OrderItem);
    orderRepo.create.mockReturnValue({ store: { id: 'store1' } } as Order);
    orderRepo.save.mockResolvedValue({ id: 'order1', store: { id: 'store1' } } as Order);

    await handler.execute(command);

    expect(orderRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      deliveryAddress: user.address,
      contactInfo: user.phoneNumber,
    }));
  });

  it('should throw BAD_REQUEST if no address and contact info', async () => {
    const noContactUser = { ...user} as User;
    const command = new CreateOrderCommand(noContactUser, 'cartId_1');

    await handler.execute(command)

    expect(logAndThrowInternalServerError).toHaveBeenCalled();
  });

  it('should throw NotFoundException if cart not found', async () => {
    const command = new CreateOrderCommand(user, 'cartId_1');
    cartRepo.findOne.mockResolvedValue(null);

    await handler.execute(command);
    expect(logAndThrowInternalServerError).toHaveBeenCalled();
  });

  it('should call logAndThrowInternalServerError on unexpected error', async () => {
    const command = new CreateOrderCommand(user, 'cartId_1', 'Adama', '+251912345678');
    cartRepo.findOne.mockRejectedValue(new Error('DB error'));

    await handler.execute(command)
    expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
      expect.any(Error),
      'CreateOrderHandler',
      'Order/Creation',
      activityLogService,
      expect.objectContaining({ cartId: 'cartId_1' }),
    );
  });
});
