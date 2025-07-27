import { Order, Store, User } from "@/entities";

export class ChapaInitializePaymentCommand {
    constructor(
         public readonly user: User,
         public readonly storeId: Store['id'],
         public readonly orderId: Order['id'],
         public readonly amount:number,
         public readonly first_name?: string,
         public readonly last_name?:string,
         public readonly email?:string,
         public readonly currency?:string,
    ){}
}