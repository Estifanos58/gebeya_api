import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteStoreCommentCommand } from "../command/deleteStoreComment.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Comment } from "@/entities";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";

@CommandHandler(DeleteStoreCommentCommand)
export class DeleteStoreCommentHandler implements ICommandHandler<DeleteStoreCommentCommand> {

    constructor(
        @InjectRepository(Comment)
        private readonly commentRepo: Repository<Comment>,
    ){}

    async execute(command: DeleteStoreCommentCommand): Promise<any> {
        const {userId, storeId, commentId} = command;

        const comment = await this.commentRepo.findOne({
            where: { id: commentId, store: { id: storeId }, user: { id: userId } },
            relations: ['user', 'store'],
        });

        if(!comment) {
            throw new NotFoundException(`Comment with ID ${commentId} not found for store ${storeId}`);
        }

        await this.commentRepo.remove(comment);

        return {
            message: 'Comment deleted successfully',
        };
        
    }
}