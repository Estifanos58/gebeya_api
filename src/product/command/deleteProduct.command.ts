import { Product, User } from "@/entities";

export class DeleteProductCommand {
    constructor(
        public readonly userId: User["id"],
        public readonly productId: Product["id"],
    ){}
}