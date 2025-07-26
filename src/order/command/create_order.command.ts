import { Cart, User } from "@/entities";

export class CreateOrderCommand {
    constructor(
        public readonly userId: User['id'],
        public readonly cartId: Cart['id']
    ){}
}