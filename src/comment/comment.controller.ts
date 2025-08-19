import { Body, Controller, Delete, Param, Patch, Post, Req, Res } from "@nestjs/common";
import { createStoreCommentDto } from "./dto/createStoreCommentDto";
import { CommandBus } from "@nestjs/cqrs";
import { Request} from "express";
import { CreateStoreCommentCommand } from "./command/createStoreComment.command";
import { UpdateStoreCommentCommand } from "./command/updateStoreComment.command";
import { UpdateStoreCommentDto } from "./dto/updateStoreCommentDto";
import { DeleteCommentCommand } from "./command/deleteComment.command";
import { CreateProductCommentDto } from "./dto/createProductCommentDto";
import { CreateProductCommentCommand } from "./command/createProductComment.command";
import { ApiResponse } from "@nestjs/swagger";

@Controller('comment')
export class CommentController {

    constructor(
        private readonly commandBus: CommandBus,
    ){}

    @Post('store/:id')
    @ApiResponse({
        status: 201,
        description: 'Comment Added',
        type: createStoreCommentDto
    })
    async storeComment(
        @Param("id") id: string,
        @Body() createComment: createStoreCommentDto,
        @Req() req: Request,
    ) {
        return await this.commandBus.execute(new CreateStoreCommentCommand(req.user , id , createComment.comment, createComment.review ));
        
    }

    @Patch('store/:id')
    @ApiResponse({
        status: 200,
        description: 'Comment updated successfully',
        type: UpdateStoreCommentDto
    })
    async updateStoreComment(
        @Param("id") id: string,
        @Body() updateComment: UpdateStoreCommentDto, // Assuming you have a DTO for this
        @Req() req: Request,
    ) {
        const { commentId, message, review } = updateComment;

        return await this.commandBus.execute(
            new UpdateStoreCommentCommand(req.user, id, commentId, message, review)
        );
    }

    @Delete('/:commentId')
    @ApiResponse({
        status: 200,
        description: 'Comment deleted successfully',
        type: String
    })
    async deleteStoreComment(
        @Param("commentId") commentId: string,
        @Req() req: Request,
    ) {
        return await this.commandBus.execute(
            new DeleteCommentCommand(req.userId, commentId)
        );
    }

    @Post('product/:productId')
    @ApiResponse({
        status: 201,
        description: 'Product comment added successfully',
        type: CreateProductCommentDto
    })
    async createProductComment(
        @Param("productId") productId: string,
        @Body() createReviewDto: CreateProductCommentDto,
        @Req() req: Request,
    ) {
        const { comment, review } = createReviewDto;

        return await this.commandBus.execute( new CreateProductCommentCommand(req.user, productId, comment, review));

    }
}