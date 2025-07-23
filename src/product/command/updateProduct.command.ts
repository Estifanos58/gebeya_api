import { Store, User } from "@/entities";
import { Skus } from "./createProduct.command";

export class UpdateProductCommand {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string,
        public readonly cover: string,
        public readonly userId: User['id'],
        public readonly categoryId: string,
        public readonly productSkus: Array<Skus&{id: string}>,
    ){}
}