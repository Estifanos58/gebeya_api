import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetCartQuery } from './query/get-cart.query';
import { CreateCartCommand } from './command/create-cart.command';
import { updateCartCommand } from './command/update-cart.command';
import { DeleteCartCommand } from './command/delete-cart.command';
import { DeleteCartItemCommand } from './command/delete-cartItem.command';

describe('CartController', () => {
  let controller: CartController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  const mockCommandBus = { execute: jest.fn() };
  const mockQueryBus = { execute: jest.fn() };

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockRequest = (userId = 'user-123', body = {}, params = {}) => ({
    userId,
    body,
    params,
  }) as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);

    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return cart successfully', async () => {
      const cartData = { items: [] };
      mockQueryBus.execute.mockResolvedValue(cartData);

      const req = mockRequest();
      const res = mockResponse();

      await controller.getCart(req, res);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetCartQuery('user-123'));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(cartData);
    });

    it('should handle errors when fetching cart', async () => {
      mockQueryBus.execute.mockRejectedValue(new Error('Cart not found'));

      const req = mockRequest();
      const res = mockResponse();

      await expect(controller.getCart(req, res)).rejects.toThrow('Cart not found');
    });
  });

  describe('createCart', () => {
    it('should create cart successfully', async () => {
      const cartData = { id: 'cart-1' };
      mockCommandBus.execute.mockResolvedValue(cartData);

      const req = mockRequest('user-123', { productSkuId: 'sku-1', quantity: 2 });
      const res = mockResponse();

      await controller.createCart(req.body, req, res);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateCartCommand('user-123', 'sku-1', 2)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(cartData);
    });
  });

  describe('updateCart', () => {
    it('should update cart successfully', async () => {
      const updatedCart = { id: 'cart-1', quantity: 5 };
      mockCommandBus.execute.mockResolvedValue(updatedCart);

      const req = mockRequest('user-123', { productSkuId: 'sku-1', quantity: 5 });
      const res = mockResponse();

      await controller.updateCart(req.body, req, res);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new updateCartCommand('user-123', 'sku-1', 5)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedCart);
    });
  });

  describe('deleteCart', () => {
    it('should delete cart successfully', async () => {
      const result = { success: true };
      mockCommandBus.execute.mockResolvedValue(result);

      const req = mockRequest();
      const res = mockResponse();

      await controller.deleteCart(req, res);

      expect(commandBus.execute).toHaveBeenCalledWith(new DeleteCartCommand('user-123'));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });

  describe('deleteCartItem', () => {
    it('should delete cart item successfully', async () => {
      const result = { success: true };
      mockCommandBus.execute.mockResolvedValue(result);

      const req = mockRequest('user-123', {}, { id: 'item-1' });
      const res = mockResponse();

      await controller.deleteCartItem('item-1', req, res);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new DeleteCartItemCommand('user-123', 'item-1')
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });
});
