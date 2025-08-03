import { Order, Store, User } from "@/entities";

export class ChapaInitializePaymentCommand {
    constructor(
         public readonly user: User,
         public readonly storeId: Store['id'],
         public readonly orderId: Order['id'],
    ){}
}