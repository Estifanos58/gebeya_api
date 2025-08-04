import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCommentCommand } from '../command/deleteComment.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '@/entities';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<any> {
    const { userId, commentId } = command;

    try {
      const comment = await this.commentRepo.findOne({
        where: { id: commentId, user: { id: userId } },
        relations: ['user', 'store'],
      });

      if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      await this.commentRepo.remove(comment);

      return {
        message: 'Comment deleted successfully',
      };
    } catch (error) {
        logAndThrowInternalServerError(
            error,
            'DeleteCommentHandler',
            'Comment/Delete',
            this.activityLogService,
            { userId, commentId }
        )
    }
  }
}
