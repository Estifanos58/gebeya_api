import { Comment, Store, User } from "@/entities";

export class UpdateStoreCommentCommand {
    constructor(
        public readonly user: User, // Assuming user is an object with necessary properties
        public readonly storeId: Store['id'],
        public readonly commentId: Comment['id'],
        public readonly message?: string,
        public readonly review?: 1 | 2 | 3 | 4 
    ) {}
}