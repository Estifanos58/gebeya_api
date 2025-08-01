import { EntityModule } from "@/entities/entity.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CommentController } from "./comment.controller";
import { CreateStoreCommentHandler } from "./handler/createStoreComment.handler";

const CommandHandlers = [CreateStoreCommentHandler]

@Module({
    imports: [
        CqrsModule,
        EntityModule
    ],
    controllers:[CommentController],
    providers: [...CommandHandlers],
    exports: []
})

export class CommentModule {}