import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ProductController } from "./product.controller"
import { Test, TestingModule } from "@nestjs/testing";
import { Response } from "express";
import { QueryProductsDto } from "./dto/query-products.dto";

describe('ProductController', () => {

    let productController: ProductController;
    let commandBus: CommandBus;
    let queryBus: QueryBus;

    beforeEach(async()=>{
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [
                {
                    provide: CommandBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                }, 
                {
                    provide: QueryBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                }
            ]
        }).compile(); 

        productController = module.get<ProductController>(ProductController);
        commandBus = module.get<CommandBus>(CommandBus);
        queryBus = module.get<QueryBus>(QueryBus);
    })


    describe('FindAll', ()=>{
        it('should return a list of products', async () => {
            const query = {
                storeId: 'store123',
                categoryId: 'category123',
                sortBy: 'name',
                sortOrder: 'ASC',
                page: 1,
                limit: 10,
                name: 'test',
                minRange: 0,
                maxRange: 100
            } as QueryProductsDto;

            const mockProducts = [{ id: 'product1', name: 'Product 1' }];

            jest.spyOn(queryBus, 'execute').mockResolvedValue(mockProducts);
            const result = await productController.findAll(query);

            expect(result).toEqual(mockProducts);
            expect(queryBus.execute).toHaveBeenCalledWith(query);
   
        })
        it('should handle errors gracefully', async () => {
            const query = {
                storeId: 'store123',
                categoryId: 'category123',
                sortBy: 'name',
                sortOrder: 'ASC',
                page: 1,
                limit: 10,
                name: 'test',
                minRange: 0,
                maxRange: 100
            } as QueryProductsDto;

            jest.spyOn(queryBus, 'execute').mockRejectedValue(new Error('Error fetching products'));

            await expect(productController.findAll(query)).rejects.toThrow('Error fetching products');
        });
    })

    describe('Create', () => {

        it('should create a product successfully', async () => {
             const dto = {
                name: 'Test Product',
                description: 'Test Description',
                cover: 'test-cover.jpg',
                storeId: 'store123',
                categoryId: 'category123',
                skus: []
            }
            jest.spyOn(commandBus, 'execute').mockResolvedValue({ id: 'product1', ...dto });
            const req = {
                user: { id: 'user123' }
            } as any;

            const result = await productController.create(dto, req);

            expect(result).toEqual({ id: 'product1', ...dto });
            expect(commandBus.execute).toHaveBeenCalledWith({
                name: dto.name,
                description: dto.description,
                cover: dto.cover,
                userId: req.user.id,
                storeId: dto.storeId,
                categoryId: dto.categoryId,
                productSkus: dto.skus
            });
        })

        it('should handle errors during product creation', async () => {
            const dto = {
                name: 'Test Product',
                description: 'Test Description',
                cover: 'test-cover.jpg',
                storeId: 'store123',
                categoryId: 'category123',
                skus: []
            }
            jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error creating product'));
            const req = {
                user: { id: 'user123' }
            } as any;

            await expect(productController.create(dto, req)).rejects.toThrow('Error creating product');
        });
    })

    describe('Update', () => {
        it('should update a product successfully', async () => {
            const updateDto = {
                name: 'Updated Product',
                description: 'Updated Description',
                cover: 'updated-cover.jpg',
                storeId: 'store123',
                categoryId: 'category123',
                skus: []
            };
            const req = {
                userId: 'user123' 
            } as any;
            const productId = 'product1';

            jest.spyOn(commandBus, 'execute').mockResolvedValue({ id: productId, ...updateDto});

            const result = await productController.update(productId, updateDto, req);

            expect(result).toEqual({ id: productId, ...updateDto });
            expect(commandBus.execute).toHaveBeenCalledWith({
                id: productId,
                name: updateDto.name,
                description: updateDto.description,
                cover: updateDto.cover,
                userId: req.userId,
                categoryId: updateDto.categoryId,
                productSkus: updateDto.skus
            });
        });

        it('should handle errors during product update', async () => {
            const updateDto = {
                name: 'Updated Product',
                description: 'Updated Description',
                cover: 'updated-cover.jpg',
                storeId: 'store123',
                categoryId: 'category123',
                skus: []
            };
            const req = {
                user: { id: 'user123' }
            } as any;
            const productId = 'product1';

            jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error updating product'));

            await expect(productController.update(productId, updateDto, req)).rejects.toThrow('Error updating product');
        });
    });

    describe('FindOne', () => {
        it('should return a product by ID', async () => {
            const productId = 'product1';
            const mockProduct = { id: productId, name: 'Product 1' };

            jest.spyOn(queryBus, 'execute').mockResolvedValue(mockProduct);
            const req = {} as any;

            const result = await productController.findOne(productId);

            expect(result).toEqual(mockProduct);
            expect(queryBus.execute).toHaveBeenCalledWith({ id: productId });
        });

        it('should handle errors when finding a product by ID', async () => {
            const productId = 'product1';

            jest.spyOn(queryBus, 'execute').mockRejectedValue(new Error('Error fetching product'));

            await expect(productController.findOne(productId)).rejects.toThrow('Error fetching product');
        });
    });

    describe('Remove', () => {
        it('should delete a product successfully', async () => {
            const productId = 'product1';
            const req = {
                userId: 'user123'
            } as any;

            jest.spyOn(commandBus, 'execute').mockResolvedValue({ id: productId });

            const result = await productController.remove(productId, req);

            expect(result).toEqual({ id: productId });
            expect(commandBus.execute).toHaveBeenCalledWith({
                userId: req.userId,
                productId
            });
        });

        it('should handle errors during product deletion', async () => {
            const productId = 'product1';
            const req = {
                userId: 'user123'
            } as any;

            jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error deleting product'));

            await expect(productController.remove(productId, req)).rejects.toThrow('Error deleting product');
        });
    });
})