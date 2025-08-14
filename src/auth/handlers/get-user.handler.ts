import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserQuery } from "../queries/get-user-query";
import { HttpException, HttpStatus } from "@nestjs/common";

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery>{
    constructor(){}
    async execute(query: GetUserQuery): Promise<any> {
        const {user} = query; 

        if(!user || Object.keys(user).length === 0){
            throw new HttpException({ message: "User Not Found"}, HttpStatus.NOT_FOUND)
        }
        return {
            message: "User data retrieved successfully",
            data: user
        }
    }
}