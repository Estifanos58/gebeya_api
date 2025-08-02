import { Product, User } from "@/entities";

export class CreateProductCommentCommand {
    constructor(
        public readonly user: User,
        public readonly productId: Product['id'],
        public readonly comment: string,
        public readonly review: number  
    ){}
}