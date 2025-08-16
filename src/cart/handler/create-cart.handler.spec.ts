import { ActivityLogService } from '@/log/activityLog.service';
import { CreateCartHandler } from './create-cart.handler';
import { Cart, CartItem, ProductSkus } from '@/entities';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateCartCommand } from '../command/create-cart.command';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';
import { HttpException } from '@nestjs/common';

jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));

describe('CreateCartHandler', () => {
  let handler: CreateCartHandler;
  let cartRepository: jest.Mocked<Repository<Cart>>;
  let cartItemRepository: jest.Mocked<Repository<CartItem>>;
  let productSkusRepository: jest.Mocked<Repository<ProductSkus>>;
  let activityLogService: ActivityLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCartHandler,
        {
          provide: getRepositoryToken(Cart),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductSkus),
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

    handler = module.get<CreateCartHandler>(CreateCartHandler);
    cartRepository = module.get(getRepositoryToken(Cart));
    cartItemRepository = module.get(getRepositoryToken(CartItem));
    productSkusRepository = module.get(getRepositoryToken(ProductSkus));
    activityLogService = module.get(ActivityLogService);
  });

  it('should create a cart successfully', async () => {
    // Arrange
    const command = {
      userId: 'userId',
      productSkuId: 'productSkuId',
      quantity: 19,
    } as CreateCartCommand;
    const mockCartItem = {
      id: 'CartItem_123',
      productSku: { id: command.productSkuId } as ProductSkus,
      quantity: 1,
    } as CartItem;
    const mockCart = {
      id: 'cart-123',
      user: { id: command.userId },
      cartItems: {
        id: 'CartItem_123',
        productSku: { id: command.productSkuId } as ProductSkus,
        quantity: 1,
        find: jest.fn().mockReturnValue(mockCartItem),
      } as unknown as CartItem[],
    } as Cart;
    
    const mockProductSku = {
      id: command.productSkuId,
      quantity: 30,
    } as ProductSkus;


    jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart);
    jest
      .spyOn(productSkusRepository, 'findOne')
      .mockResolvedValue(mockProductSku);
    jest.spyOn(cartItemRepository, 'save').mockResolvedValue(mockCartItem);
    jest.spyOn(cartRepository, 'save').mockResolvedValue(mockCart);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(cartRepository.findOne).toHaveBeenCalledWith({
      where: { user: { id: command.userId } },
      relations: ['cartItems', 'cartItems.productSku', 'user'],
    });
    expect(productSkusRepository.findOne).toHaveBeenCalledWith({
      where: { id: command.productSkuId },
    });
    expect(mockCart.cartItems.find).toHaveBeenCalledWith(expect.any(Function));
    expect(cartItemRepository.save).toHaveBeenCalled()
  });

  it('should throw an error if product SKU is not found', async () => {
    const command = {
      userId: 'userId',
      productSkuId: 'productSkuId',
      quantity: 19,
    } as CreateCartCommand;

    jest.spyOn(cartRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(productSkusRepository, 'findOne').mockResolvedValue(null);

    await handler.execute(command);

    expect(productSkusRepository.findOne).toHaveBeenCalledWith({
      where: { id: command.productSkuId },
    });
    expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
      expect.any(HttpException),
      'CreateCartHandler',
        'Cart/Creation',
        activityLogService,
        expect.any(Object)
    )
  })

  it('should throw an error if requested quantity exceeds available stock', async () => {
     const command = {
      userId: 'userId',
      productSkuId: 'productSkuId',
      quantity: 21,
    } as CreateCartCommand;

     const mockProductSku = {
      id: command.productSkuId,
      quantity: 20,
    } as ProductSkus;

    jest.spyOn(cartRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(productSkusRepository, 'findOne').mockResolvedValue(mockProductSku)

    await handler.execute(command);

    expect(productSkusRepository.findOne).toHaveBeenCalledWith({
      where: { id: command.productSkuId },
    });
    expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
      expect.any(HttpException),
      'CreateCartHandler',
        'Cart/Creation',
        activityLogService,
        expect.any(Object)
    )
  })

  it('should trown and Error if the cummulative quantity exceeds available stock', async ()=>{
    const command = {
      userId: 'userId',
      productSkuId: 'productSkuId',
      quantity: 10,
    } as CreateCartCommand;
    const mockCartItem = {
      id: 'CartItem_123',
      productSku: { id: command.productSkuId } as ProductSkus,
      quantity: 10,
    } as CartItem;
    const mockCart = {
      id: 'cart-123',
      user: { id: command.userId },
      cartItems: {
        id: 'CartItem_123',
        productSku: { id: command.productSkuId } as ProductSkus,
        quantity: 1,
        find: jest.fn().mockReturnValue(mockCartItem),
      } as unknown as CartItem[],
    } as Cart;
    
    const mockProductSku = {
      id: command.productSkuId,
      quantity: 20,
    } as ProductSkus;

    
    jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart);
    jest
      .spyOn(productSkusRepository, 'findOne')
      .mockResolvedValue(mockProductSku);
    jest.spyOn(cartItemRepository, 'save').mockResolvedValue(mockCartItem);
    jest.spyOn(cartRepository, 'save').mockResolvedValue(mockCart);

    await handler.execute(command);

      expect(cartRepository.findOne).toHaveBeenCalledWith({
      where: { user: { id: command.userId } },
      relations: ['cartItems', 'cartItems.productSku', 'user'],
    });
    expect(productSkusRepository.findOne).toHaveBeenCalledWith({
      where: { id: command.productSkuId },
    });
    expect(mockCart.cartItems.find).toHaveBeenCalledWith(expect.any(Function));
    expect(activityLogService.warn).toHaveBeenCalled();
    expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
      expect.any(HttpException),
      'CreateCartHandler',
        'Cart/Creation',
        activityLogService,
        expect.any(Object)
    )

  })
});
