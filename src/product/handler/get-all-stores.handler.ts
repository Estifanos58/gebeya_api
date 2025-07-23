import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllStoreQuery } from "../query/get-all-stores.query";
import { InjectRepository } from "@nestjs/typeorm";
import { Store } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";

@QueryHandler(GetAllStoreQuery)
export class GetAllStoreHandler implements IQueryHandler<GetAllStoreQuery>{

    constructor(
        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>
    ){}
    async execute(query: GetAllStoreQuery): Promise<any> {
        try {
            const store = await this.storeRepo.find();

            if(!store) throw new HttpException({ message: "Stores Not Found"}, HttpStatus.NOT_FOUND)

            return {
                message: "Stores Found",
                data: store
            }
        } catch (error) {
            throw new HttpException({ message: "Server Issue"}, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}