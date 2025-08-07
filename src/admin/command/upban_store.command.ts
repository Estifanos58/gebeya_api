import { Store, User } from "@/entities";

export class UnBanStoreCommand{
    constructor(
        public readonly storeId: Store['id'],
        public readonly user: User
    ){}
}