import { Cart, User } from "@/entities";

export class CreateOrderCommand {
    constructor(
        public readonly user: User,
        public readonly cartId: Cart['id'],
        public readonly deliveryAddress?: string,
        public readonly contactInfo?: string
    ){}
}