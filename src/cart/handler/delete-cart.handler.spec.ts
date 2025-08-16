import { Cart } from "@/entities";
import { DeleteCartHandler } from "./delete-cart.handler";
import { Repository } from "typeorm";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DeleteCartCommand } from "../command/delete-cart.command";
import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { NotFoundException } from "@nestjs/common";

jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));

describe('DeleteCartHadler', ()=>{
    let handler: DeleteCartHandler;
    let cartRepository: jest.Mocked<Repository<Cart>>;
    let activityLogService: ActivityLogService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteCartHandler,
                {
                    provide: getRepositoryToken(Cart),
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

        handler = module.get<DeleteCartHandler>(DeleteCartHandler);
        cartRepository = module.get(getRepositoryToken(Cart));
        activityLogService = module.get(ActivityLogService);
    });

    it('should delete cart successfully', async () => {
        const command = { userId: 'userId'} as DeleteCartCommand
        const mockCart = { id: 'cartId', user: { id: 'userId' } } as Cart;

        jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart);

        const result = await handler.execute(command);

        expect(cartRepository.findOne).toHaveBeenCalledWith({
            where: { user: { id: command.userId } },
            relations: ['user'],
        });
        expect(cartRepository.remove).toHaveBeenCalledWith(mockCart);
        expect(result).toEqual({
            message: `Cart for user ${command.userId} deleted successfully`,
        });
    })

    it('should throw NotFoundException if cart does not exist', async () => {
        const command = { userId: 'userId' } as DeleteCartCommand;

        jest.spyOn(cartRepository, 'findOne').mockResolvedValue(null);

        await handler.execute(command)

        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(NotFoundException),
            'DeleteCartHandler',
            'Cart/Deletion',
            activityLogService,
            expect.any(Object)
        )
    });
})