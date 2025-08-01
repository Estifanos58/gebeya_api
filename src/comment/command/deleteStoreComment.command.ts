import { Comment, Store, User } from "@/entities";

export class DeleteStoreCommentCommand {
    constructor(
        public readonly userId: User['id'],
        public readonly storeId: Store['id'],
        public readonly commentId: Comment['id'],
    ){}
}