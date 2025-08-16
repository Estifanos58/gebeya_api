import { Repository } from "typeorm";
import { UpdateCartHandler } from "./update-cart.handler";
import { CartItem, ProductSkus } from "@/entities";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { updateCartCommand } from "../command/update-cart.command";
import { logAndThrowInternalServerError } from "@/utils/InternalServerError";

jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));

describe('UpdateCartHandler', ()=>{
    let handler: UpdateCartHandler;
    let cartItemRepository: jest.Mocked<Repository<CartItem>>;
    let productSkusRepository: jest.Mocked<Repository<ProductSkus>>;
    let activityLogService: ActivityLogService;

    beforeEach(async()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateCartHandler,
                {
                    provide: getRepositoryToken(CartItem),
                    useValue: {
                        findOne: jest.fn(),
                        remove: jest.fn(),
                        save: jest.fn()

                    }
                },
                {
                    provide: getRepositoryToken(ProductSkus),
                    useValue: {
                        findOne: jest.fn()
                    }
                },
                {
                    provide: ActivityLogService,
                    useValue: {}
                }
            ]
        }).compile()

        handler = module.get<UpdateCartHandler>(UpdateCartHandler);
        cartItemRepository = module.get(getRepositoryToken(CartItem));
        productSkusRepository = module.get(getRepositoryToken(ProductSkus));    
    })

    it('should update a CartItem', async()=>{
        const command = { userId: 'userId', productSkuId: 'productSkuId', quantity: 10 } as updateCartCommand 

        const mockCartItem = {
            id: "cartItem",
            quantity: 5
        } as CartItem

        const mockProductSku = {
            quantity: 15
        } as ProductSkus

        jest.spyOn(cartItemRepository, 'findOne').mockResolvedValue(mockCartItem)
        jest.spyOn(productSkusRepository, 'findOne').mockResolvedValue(mockProductSku)

        const newCartItem = {...mockCartItem, quantity: command.quantity}

        const result = await handler.execute(command);

        expect(cartItemRepository.findOne).toHaveBeenCalledWith({
            where: {
                cart: { user: { id: command.userId}},
                productSku: {id: command.productSkuId}
            },
            relations: ['cart','cart.user', 'productSku'],
        })
        expect(productSkusRepository.findOne).toHaveBeenCalledWith({
            where: { id: command.productSkuId}
        })
        expect(cartItemRepository.save).toHaveBeenCalledWith(newCartItem)
    })

    it('should remove the cartItem if the quantity is zero', async ()=>{
          const command = { userId: 'userId', productSkuId: 'productSkuId', quantity: 0 } as updateCartCommand 

          const mockCartItem = {
            id: "cartItem",
            quantity: 5
        } as CartItem

        jest.spyOn(cartItemRepository, 'findOne').mockResolvedValue(mockCartItem)

        const result  = await handler.execute(command);

       
        expect(cartItemRepository.findOne).toHaveBeenCalledWith({
            where: {
                cart: { user: { id: command.userId}},
                productSku: {id: command.productSkuId}
            },
            relations: ['cart','cart.user', 'productSku'],
        })
        expect(cartItemRepository.remove).toHaveBeenCalledWith(mockCartItem)
        expect(result).toEqual( {message: 'Cart item removed successfully'})
    })

    it('should throw an Exception if no cartItem is found', async()=>{
          const command = { userId: 'userId', productSkuId: 'productSkuId', quantity: 10 } as updateCartCommand 

          jest.spyOn(cartItemRepository, 'findOne').mockResolvedValue(null);

          await handler.execute(command);

          expect(logAndThrowInternalServerError).toHaveBeenCalled()
    })
})