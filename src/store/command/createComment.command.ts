import { Store, User } from "@/entities";

export class CreateCommentCommand {
    constructor(
        public readonly userId: User['id'],
        public readonly storeId: Store['id'],
        public readonly comment: string,
        public readonly review: number,
    ){}
}