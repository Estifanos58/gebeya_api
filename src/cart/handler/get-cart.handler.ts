import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCartQuery } from "../query/get-cart.query";
import { InjectRepository } from "@nestjs/typeorm";
import { Cart } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";


@QueryHandler(GetCartQuery)
export class GetCartHandler implements IQueryHandler<GetCartQuery> {
    constructor(
        @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    ) {}

    async execute(query: GetCartQuery): Promise<any> {
        const { userId } = query;

        try {
              const cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['cartItems', 'cartItems.productSku', 'user'],
        })

        if (!cart) {
            throw new NotFoundException(`Cart for user ${userId} not found`);
        }

        return {
            message: "Cart retrieved successfully",
            data: cart
        }
        } catch (error) {
            throw new HttpException({message: error.message}, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      
    }
}