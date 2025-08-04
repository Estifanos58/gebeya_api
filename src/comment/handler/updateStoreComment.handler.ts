import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateStoreCommentCommand } from '../command/updateStoreComment.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '@/entities';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@CommandHandler(UpdateStoreCommentCommand)
export class UpdateStoreCommentHandler
  implements ICommandHandler<UpdateStoreCommentCommand>
{
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: UpdateStoreCommentCommand): Promise<any> {
    const { user, storeId, commentId, message, review } = command;

    try {
      const comment = await this.commentRepo.findOne({
        where: { id: commentId, store: { id: storeId }, user: { id: user.id } },
        relations: ['user', 'store'],
      });

      if (!comment) {
        throw new NotFoundException(
          `Comment with ID ${commentId} not found for store ${storeId}`,
        );
      }

      // Update the comment properties
      comment.message = message || comment.message;
      comment.review = review || comment.review;

      await this.commentRepo.save(comment);

      return {
        message: 'Comment updated successfully',
        data: {
          user,
          storeId,
          commentId,
          message,
          review,
        },
      };
    } catch (error) {
      logAndThrowInternalServerError(
        error,
        'UpdateStoreCommentHandler',
        'Comment/Update',
        this.activityLogService,
        { userId: user.id, storeId, commentId}
      )
    }
  }
}
