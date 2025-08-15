import { Repository } from "typeorm";
import { UpdateProductHandler } from "./update-product.handler"
import { Category, Product, ProductSkus, Store } from "@/entities";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UpdateProductCommand } from "../command/updateProduct.command";

jest.mock('@/utils/InternalServerError', ()=>({
    logAndThrowInternalServerError: jest.fn()
}))

describe('UpdateProductHandler', ()=>{
    let handler: UpdateProductHandler;
    let productRepo: jest.Mocked<Repository<Product>>;
    let storeRepo: jest.Mocked<Repository<Store>>;
    let categoryRepo: jest.Mocked<Repository<Category>>;
    let productSkusRepo: jest.Mocked<Repository<ProductSkus>>;
    let activityLogService: ActivityLogService;

    beforeEach(async()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateProductHandler,
                {
                    provide: getRepositoryToken(Product),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(Store),
                    useValue: {
                        findOne: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(Category),
                    useValue: {
                        findOne: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(ProductSkus),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                    }
                },
                {
                    provide: ActivityLogService,
                    useValue: { log: jest.fn() }
                }
            ]
        }).compile()  

        handler = module.get<UpdateProductHandler>(UpdateProductHandler);
        productRepo = module.get(getRepositoryToken(Product));
        storeRepo = module.get(getRepositoryToken(Store));
        categoryRepo = module.get(getRepositoryToken(Category));
        productSkusRepo = module.get(getRepositoryToken(ProductSkus));
        activityLogService = module.get<ActivityLogService>(ActivityLogService);
    })

    it('should update product with valid data', async () => {
        const command = {
            id: '1',
            name: 'Updated Product',
            description: 'Updated Description',
            cover: 'updated-cover.jpg',
            userId: '1',
            categoryId: '2',
            productSkus: [{ id: '1', price: 100 }],
        }  as UpdateProductCommand;

        const mockProduct = new Product();
        mockProduct.id = '1';
        mockProduct.store = { user: { id: '1' } } as Store;

        productRepo.findOne.mockResolvedValue(mockProduct);
        categoryRepo.findOne.mockResolvedValue({ id: '2' } as Category);
        productSkusRepo.findOne.mockResolvedValue({ id: '1', price: 50 } as ProductSkus);

        await handler.execute(command);

        expect(productRepo.findOne).toHaveBeenCalledWith({
            where: { id: command.id, store: { user: { id: command.userId } } },
            relations: ['store', 'store.user'],
        });
        expect(productRepo.save).toHaveBeenCalledWith(expect.objectContaining({
            name: command.name,
            description: command.description,
            cover: command.cover,
            category: expect.objectContaining({ id: command.categoryId }),
        }));
        expect(productSkusRepo.save).toHaveBeenCalledWith(expect.objectContaining({
            id: '1',
            price: command.productSkus[0].price,
            prevPrice: 50,
        }));
    });
})