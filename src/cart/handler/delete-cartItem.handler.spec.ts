import { Repository } from "typeorm";
import { DeleteCartItemHandler } from "./delete-cartItem.handler";
import { CartItem } from "@/entities";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DeleteCartItemCommand } from "../command/delete-cartItem.command";
import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { NotFoundException } from "@nestjs/common";

jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));

describe('DeleteCartItemHandler', ()=>{
    let handler: DeleteCartItemHandler;
    let cartItemRepository: jest.Mocked<Repository<CartItem>>;
    let activityLogService: ActivityLogService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                DeleteCartItemHandler,
                {
                    provide: getRepositoryToken(CartItem),
                    useValue: {
                        findOne: jest.fn(),
                        remove: jest.fn(),
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

        handler = module.get<DeleteCartItemHandler>(DeleteCartItemHandler);
        cartItemRepository = module.get(getRepositoryToken(CartItem));
        activityLogService = module.get(ActivityLogService);
    });

    it('should delete cart item successfully', async () => {
        const command = { userId: 'userId', cartItemId: 'cartItemId' } as DeleteCartItemCommand;
        const mockCartItem = { id: 'cartItemId', cart: { user: { id: 'userId' } } } as CartItem;

        jest.spyOn(cartItemRepository, 'findOne').mockResolvedValue(mockCartItem);

        const result = await handler.execute(command);

        expect(cartItemRepository.findOne).toHaveBeenCalledWith({
            where: { id: command.cartItemId, cart: { user: { id: command.userId } } },
            relations: ['cart', 'productSku', 'cart.user'],
        });
        expect(cartItemRepository.remove).toHaveBeenCalledWith(mockCartItem);
        expect(result).toEqual({
            message: `Cart item with ID ${command.cartItemId} for user ${command.userId} deleted successfully`,
        });
    });

    it('should Throw an Error if No CartItem Found', async ()=>{
        const command = { userId: 'userId', cartItemId: 'cartItemId' } as DeleteCartItemCommand;
        jest.spyOn(cartItemRepository, 'findOne').mockResolvedValue(null);

        await handler.execute(command);

        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(NotFoundException),
            'DeleteCartItemHandler',
            'Cart/Item Deletion',
            activityLogService,
            expect.any(Object)
        )
    })
})