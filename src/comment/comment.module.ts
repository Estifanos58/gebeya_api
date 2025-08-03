import { EntityModule } from '@/entities/entity.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommentController } from './comment.controller';
import { CreateStoreCommentHandler } from './handler/createStoreComment.handler';
import { UpdateStoreCommentHandler } from './handler/updateStoreComment.handler';
import { DeleteCommentHandler } from './handler/deleteComment.handler';
import { CreateProductCommentHandler } from './handler/createProductComment.handler';

const CommandHandlers = [
  CreateStoreCommentHandler,
  UpdateStoreCommentHandler,
  DeleteCommentHandler,
  CreateProductCommentHandler,
];

@Module({
  imports: [CqrsModule, EntityModule],
  controllers: [CommentController],
  providers: [...CommandHandlers],
  exports: [],
})
export class CommentModule {}
