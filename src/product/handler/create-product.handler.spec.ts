import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { CreateProductHandler } from "./create-product.handler";
import { Repository } from "typeorm";
import { Category, Product, ProductSkus, Store } from "@/entities";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateProductCommand } from "../command/createProduct.command";
import { HttpException } from "@nestjs/common";

jest.mock('@/utils/InternalServerError', ()=>({
    logAndThrowInternalServerError: jest.fn(),
}))

describe('CreateProductHandler', () => {
    let handler: CreateProductHandler;
    let storeRepo: jest.Mocked<Repository<Store>>;
    let productRepo: jest.Mocked<Repository<Product>>;
    let productSkusRepo: jest.Mocked<Repository<ProductSkus>>;
    let categoryRepo: jest.Mocked<Repository<Category>>;
    let activityLogServie: ActivityLogService;

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateProductHandler,
                {
                    provide: getRepositoryToken(Store),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide : getRepositoryToken(Product),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                    }
                }, 
                {
                    provide: getRepositoryToken(ProductSkus),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn()
                    }
                }, 
                {
                    provide: getRepositoryToken(Category),
                    useValue: {
                        findOne: jest.fn(),
                    }
                }, 
                {
                    provide : ActivityLogService,
                    useValue: {
                        info: jest.fn(),
                        error: jest.fn(),
                    }
                }
            ]
        }).compile()

        handler = module.get<CreateProductHandler>(CreateProductHandler);
        storeRepo = module.get(getRepositoryToken(Store));
        productRepo = module.get(getRepositoryToken(Product));
        productSkusRepo = module.get(getRepositoryToken(ProductSkus));
        categoryRepo = module.get(getRepositoryToken(Category));
        activityLogServie = module.get<ActivityLogService>(ActivityLogService);
    })


    it('should be defined', () => {
            expect(handler).toBeDefined();
        })

    it('should create a product successfully', async () => {
        const mockStore = { id: 'store1', user: { id: 'user1' }, isVerified: true, banned: false } as Store;
        const mockCategory = { id: 'category1' } as Category;
        const mockProduct = { id: 'product1', name: 'Test Product' } as Product;
        const mockProductSkus = {} as ProductSkus;
        const dto = {
            name: 'Test Product',
            description: 'Test Description',
            cover: 'test-cover.jpg',
            userId: 'user1',
            storeId: 'store1',
            categoryId: 'category1',
            productSkus: [],
        } as CreateProductCommand;

        jest.spyOn(storeRepo, 'findOne').mockResolvedValue(mockStore);
        jest.spyOn(categoryRepo, 'findOne').mockResolvedValue(mockCategory);
        jest.spyOn(productRepo, 'create').mockReturnValue(mockProduct);
        jest.spyOn(productRepo, 'save').mockResolvedValue(mockProduct);
        jest.spyOn(productSkusRepo, 'save').mockResolvedValue(mockProductSkus);

        const result = await handler.execute(dto);

        expect(storeRepo.findOne).toHaveBeenCalledWith({
            where: { id: dto.storeId, user: { id: dto.userId } },
            relations: ['user'],
        })
        expect(categoryRepo.findOne).toHaveBeenCalledWith({
            where: {id: dto.categoryId },
        })
        expect(productRepo.create).toHaveBeenCalledWith({
            name: dto.name,
            description: dto.description,
            cover: dto.cover,
            store: mockStore,
            category: mockCategory,
        });
        expect(productRepo.save).toHaveBeenCalledWith(mockProduct);
        expect(result).toEqual({
            message: "Product created successfully",
            product: mockProduct,
            skus: mockProductSkus,
        });
    })

    it('should throw an error if store is not found', async () => {
        const dto = {
            name: 'Test Product',
            description: 'Test Description',
            cover: 'test-cover.jpg',
            userId: 'user1',
            storeId: 'store1',
            categoryId: 'category1',
            productSkus: [],
        } as CreateProductCommand;

        jest.spyOn(storeRepo, 'findOne').mockResolvedValue(null);

        await handler.execute(dto)

        expect(storeRepo.findOne).toHaveBeenCalledWith({
            where: { id: dto.storeId, user: { id: dto.userId }},
            relations: ['user'],
        });
        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(HttpException),
            'CreateProductHandler',
            'Product/Creation',
            activityLogServie,
            expect.any(Object),
        );
    });

    it('should throw an error if category is not found', async () => {
        const mockStore = { id: 'store1', user: { id: 'user1' }, isVerified: true, banned: false } as Store;
        const dto = {
            name: 'Test Product',
            description: 'Test Description',
            cover: 'test-cover.jpg',
            userId: 'user1',
            storeId: 'store1',
            categoryId: 'category1',
            productSkus: [],
        } as CreateProductCommand;

        jest.spyOn(storeRepo, 'findOne').mockResolvedValue(mockStore);
        jest.spyOn(categoryRepo, 'findOne').mockResolvedValue(null);

        await handler.execute(dto)

        expect(storeRepo.findOne).toHaveBeenCalledWith({
            where: { id: dto.storeId, user: { id: dto.userId } },
            relations: ['user'],
        });
        expect(categoryRepo.findOne).toHaveBeenCalledWith({
            where: { id: dto.categoryId },
        });
        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(HttpException),
            'CreateProductHandler',
            'Product/Creation',
            activityLogServie,
            expect.any(Object),
        );
    });

    it('should throw an error if store is not verified', async () => {
        const mockStore = { id: 'store1', user: { id: 'user1' }, isVerified: false, banned: false } as Store;
        const dto = {
            name: 'Test Product',
            description: 'Test Description',
            cover: 'test-cover.jpg',
            userId: 'user1',
            storeId: 'store1',
            categoryId: 'category1',
            productSkus: [],
        } as CreateProductCommand;

        jest.spyOn(storeRepo, 'findOne').mockResolvedValue(mockStore);

        await handler.execute(dto)

        expect(storeRepo.findOne).toHaveBeenCalledWith({
            where: { id: dto.storeId, user: { id: dto.userId } },
            relations: ['user'],
        });
        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(HttpException),
            'CreateProductHandler',
            'Product/Creation',
            activityLogServie,
            expect.any(Object),
        );
    });

    it('should throw an error if store is banned', async () => {
        const mockStore = { id: 'store1', user: { id: 'user1' }, isVerified: true, banned: true } as Store;
        const dto = {
            name: 'Test Product',
            description: 'Test Description',
            cover: 'test-cover.jpg',
            userId: 'user1',
            storeId: 'store1',
            categoryId: 'category1',
            productSkus: [],
        } as CreateProductCommand;
        jest.spyOn(storeRepo, 'findOne').mockResolvedValue(mockStore);
        await handler.execute(dto)
        expect(storeRepo.findOne).toHaveBeenCalledWith({
            where: { id: dto.storeId, user: { id: dto.userId } },
            relations: ['user'],
        });
        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(HttpException),
            'CreateProductHandler',
            'Product/Creation',
            activityLogServie,
            expect.any(Object),
        );
    })
})