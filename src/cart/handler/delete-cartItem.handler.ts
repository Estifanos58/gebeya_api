import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteCartItemCommand } from "../command/delete-cartItem.command";
import { InjectRepository } from "@nestjs/typeorm";
import { CartItem } from "@/entities";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";


@CommandHandler(DeleteCartItemCommand)
export class DeleteCartItemHandler implements ICommandHandler<DeleteCartItemCommand> {
    constructor(
        @InjectRepository(CartItem)
        private readonly cartItemRepository: Repository<CartItem>,
    ) {}

    async execute(command: DeleteCartItemCommand): Promise<any> {
        const { userId, cartItemId } = command;
        const cartItem = await this.cartItemRepository.findOne({
            where: { id: cartItemId, cart: { user: { id: userId } } },
            relations: ['cart', 'productSku', 'cart.user'],
        });

        if (!cartItem) {
            throw new NotFoundException(`Cart item with ID ${cartItemId} for user ${userId} not found`);
        }

        await this.cartItemRepository.remove(cartItem);

        return {
            message: `Cart item with ID ${cartItemId} for user ${userId} deleted successfully`,
        };
    }
}