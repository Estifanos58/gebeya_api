import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteCartCommand } from "../command/delete-cart.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Cart } from "@/entities";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";


@CommandHandler(DeleteCartCommand)
export class DeleteCartHandler implements ICommandHandler<DeleteCartCommand> {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepository: Repository<Cart>,
    ) {}

    async execute(command: DeleteCartCommand): Promise<any> {
        const { userId } = command;
        const cart = await this.cartRepository.findOne({ where: { user : {id: userId} } , relations: ['user']});

        if (!cart) {
            throw new NotFoundException(`Cart for user ${userId} not found`);
        }

        await this.cartRepository.remove(cart);

        return {
            message: `Cart for user ${userId} deleted successfully`
        }
    }
}