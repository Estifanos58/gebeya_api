import { Store, User } from "@/entities";

export class CreateStoreCommentCommand {
    constructor(
        public readonly user: User,
        public readonly storeId: Store['id'],
        public readonly comment: string,
        public readonly review: number,
    ){}
}