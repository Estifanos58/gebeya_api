import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllStoreQuery } from "../query/get-all-stores.query";
import { InjectRepository } from "@nestjs/typeorm";
import { Store } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ActivityLogService } from "@/log/activityLog.service";
import { logAndThrowInternalServerError } from "@/utils/InternalServerError";

@QueryHandler(GetAllStoreQuery)
export class GetAllStoreHandler implements IQueryHandler<GetAllStoreQuery>{

    constructor(
        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>,
        private readonly activityLogService: ActivityLogService
    ){}
    async execute(query: GetAllStoreQuery): Promise<any> {
        try {
            const store = await this.storeRepo.find();

            if(!store) throw new HttpException({ message: "Stores Not Found"}, HttpStatus.NOT_FOUND)

            return {
                message: "Returns all stores",
                data: store
            }
        } catch (error) {
           logAndThrowInternalServerError(
            error,
            'GetAllStoreHandler',
            'Get All Stores Query',
            this.activityLogService
           )
        }
    }
}