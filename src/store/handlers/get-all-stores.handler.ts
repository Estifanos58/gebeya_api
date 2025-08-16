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
        const { name, orderBy, sortBy, isVerified, banned } = query;

        try {
            const queryBuilder = this.storeRepo.createQueryBuilder('store')
                .leftJoinAndSelect('store.user', 'user')
                .leftJoinAndSelect('store.product', 'product')
                .leftJoinAndSelect('store.comment', 'comment')
                .leftJoinAndSelect('store.payments', 'payments')

            if(name) queryBuilder.where('store.name ILIKE :name', { name: `%${name}%` });
            if(isVerified !== null) queryBuilder.andWhere('store.isVerified = :isVerified', { isVerified });
            if(banned !== null) queryBuilder.andWhere('store.banned = :banned', { banned });
            if(orderBy) {
                queryBuilder.orderBy(`store.${orderBy}`, sortBy);
            } else {
                queryBuilder.orderBy('store.createdAt', sortBy);
            }
            const store = await queryBuilder.getMany();

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