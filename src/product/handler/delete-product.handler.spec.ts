import { Product } from "@/entities";
import { DeleteProductHandler } from "./delete-product.handler";
import { Repository } from "typeorm";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DeleteProductCommand } from "../command/deleteProduct.command";
import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { HttpException } from "@nestjs/common";

jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));

describe('DeleteProductHandler', () => {
    let handler: DeleteProductHandler;
    let productRepo: jest.Mocked<Repository<Product>>;
    let activityLogService: ActivityLogService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteProductHandler,
                {
                    provide: getRepositoryToken(Product),
                    useValue: {
                        findOne: jest.fn(),
                        remove: jest.fn(),
                    },
                },
                {
                    provide: ActivityLogService,
                    useValue: {
                        info: jest.fn(),
                        error: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = module.get<DeleteProductHandler>(DeleteProductHandler);
        productRepo = module.get(getRepositoryToken(Product));
        activityLogService = module.get<ActivityLogService>(ActivityLogService);
    });


    it('should delete a product successfully', async () => {
        const mockProduct = { id: '1', store: { user: { id: 'user1' } } } as Product;
        productRepo.findOne.mockResolvedValue(mockProduct);
        productRepo.remove.mockResolvedValue(mockProduct);

        const result = await handler.execute(new DeleteProductCommand('user1', '1'));

        expect(productRepo.findOne).toHaveBeenCalledWith({
            where: { id: '1', store: { user: { id: 'user1' } } },
            relations: ['store', 'store.user'],
        });
        expect(productRepo.remove).toHaveBeenCalledWith(mockProduct);
        expect(result).toEqual({ message: 'Product deleted successfully' });
    });

    it('should throw an error if product is not found', async () => {
        productRepo.findOne.mockResolvedValue(null);

        await handler.execute(new DeleteProductCommand('user1', '1'))

        expect(productRepo.findOne).toHaveBeenCalledWith({
            where: { id: '1', store: { user: { id: 'user1' } } },
            relations: ['store', 'store.user'],
        });

        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(HttpException),
            "DeleteProductHandler",
            "Product/Delete",
            activityLogService,
            {
              userId: 'user1',
              productId: '1',
            },
        );
    });


})