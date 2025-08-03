import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetStoreQuery } from "../query/get-store.query";
import { InjectRepository } from "@nestjs/typeorm";
import { Store } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";

@QueryHandler(GetStoreQuery)
export class GetStoreHandler implements IQueryHandler<GetStoreQuery> {

    constructor(
        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>
    ) {}

    async execute(query: GetStoreQuery): Promise<any> {
        const { storeId } = query;

        // console.log("storeId: ", storeId);

        const relations = [
            'user',
            'product',
            'product.skus',
            'product.category',
            'comment',
            'comment.user',
            // Add more relations here if needed, like orders, ratings, etc.
        ];

        const store = await this.storeRepo.findOne({
            where: { id: storeId },
            relations,
        });

        if (!store) {
            throw new HttpException({ message: "Store Not Found" }, HttpStatus.NOT_FOUND);
        }

        return {
            message: "Returns a specific store by ID",
            data: store
        }
            ;
    }
}
