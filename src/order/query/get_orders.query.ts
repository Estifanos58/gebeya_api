import { OrderStatus, User } from "@/entities";

export class GetOrdersQuery {
    constructor(
        public readonly userId: User['id'],
        public readonly status?: OrderStatus
    ){}
}