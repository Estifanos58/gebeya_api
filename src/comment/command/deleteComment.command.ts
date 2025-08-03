import { Comment, Store, User } from "@/entities";

export class DeleteCommentCommand {
    constructor(
        public readonly userId: User['id'],
        public readonly commentId: Comment['id'],
    ){}
}