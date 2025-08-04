import { OrderStatus, Store, User } from "@/entities";

export class GetStoreOrdersQuery {
    constructor(
        public readonly userId: User['id'],
        public readonly storeId: Store['id'],
        public readonly status?: OrderStatus
    ){}
}