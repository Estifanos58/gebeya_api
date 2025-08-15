import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { FindProductHandler } from "./find-product.handler";
import { Repository } from "typeorm";
import { Product } from "@/entities";
import { ActivityLogService } from "@/log/activityLog.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { FindProductQuery } from "../query/find-product.query";
import { HttpException } from "@nestjs/common";

jest.mock('@/utils/InternalServerError', ()=>({
    logAndThrowInternalServerError: jest.fn()
}))

describe('FindProductHandler',()=> {
    let handler: FindProductHandler;
    let productRepo: jest.Mocked<Repository<Product>>;
    let activityLogService: ActivityLogService

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FindProductHandler,
                {
                    provide: getRepositoryToken(Product),
                    useValue: {
                        findOneOrFail: jest.fn()
                    }
                },
                {
                    provide: ActivityLogService,
                    useValue: {

                    }
                }
            ]
        }).compile()

        handler = module.get<FindProductHandler>(FindProductHandler);
        productRepo = module.get(getRepositoryToken(Product));
        activityLogService = module.get<ActivityLogService>(ActivityLogService)
    })

     it('should find a product and return ', async()=>{
        const query = {id: '123'} as FindProductQuery;
        const mockedProduct = {
            id: "123",
            name: "mocked Product",
            description: "This is the Mocked Product",
            cover: "This is the Cover Image URL",
            category: {
                "id": "categoryId_1",
                "name": "Category Name"
            },
            skus: [
                {
                    "id": "1234",
                    "product": "123"
                }
            ]
        } as unknown as Product

        jest.spyOn(productRepo, 'findOneOrFail').mockResolvedValue(mockedProduct);

        const result = await handler.execute(query)

        expect(result).toEqual({
            message: 'Retrieve a product by ID',
            data: mockedProduct
        })
        expect(productRepo.findOneOrFail).toHaveBeenCalledWith({
            where: {id: query.id},
            relations: ['skus', 'category', 'comment', 'store']
        })

    })

    it('should Throw Error if No Product Found', async ()=> {
        const query = {id: '123'} as FindProductQuery;
        jest.spyOn(productRepo, 'findOneOrFail').mockResolvedValue({}as Product);

        await handler.execute(query);

        expect(productRepo.findOneOrFail).toHaveBeenCalledWith({
             where: { id: query.id },
            relations: ['skus', 'category', 'comment', 'store']
        })
        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(HttpException),
            "FindProductHandler",
            "Product/Find",
            activityLogService,
            {
                productId: query.id
            }            
        )
    })
})