import { Store, User } from "@/entities";

export class GetStoreQuery{
    constructor(
        public readonly storeId: Store["id"],
    ){}
}