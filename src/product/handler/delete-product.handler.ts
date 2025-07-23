import { CommandHandler, IQueryHandler } from "@nestjs/cqrs";
import { DeleteProductCommand } from "../command/deleteProduct.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";

@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler implements IQueryHandler<DeleteProductCommand> {
    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>
    ) {}

    async execute(command: DeleteProductCommand): Promise<any> {
        const { userId, productId } = command;

        const product = await this.productRepo.findOne({
            where: { id: productId, store: { user: { id: userId } } },
            relations: ['store', 'store.user']
        });

        if (!product) {
            throw new HttpException({ message: "Product Not Found" }, HttpStatus.NOT_FOUND);
        }

        await this.productRepo.remove(product);

        return { message: "Product deleted successfully" };
    }
}