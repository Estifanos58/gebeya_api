import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserQuery } from "../queries/get-user-query";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery>{
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>
    ){}
    async execute(query: GetUserQuery): Promise<any> {
        const {user} = query; 

        if(!user){
            throw new HttpException({ message: "User Not Found"}, HttpStatus.NOT_FOUND)
        }
        return {
            message: "User data retrieved successfully",
            data: user
        }
    }
}