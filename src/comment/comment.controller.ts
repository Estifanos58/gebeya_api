import { Body, Controller, Delete, Param, Patch, Post, Req, Res } from "@nestjs/common";
import { createStoreCommentDto } from "./dto/createStoreCommentDto";
import { CommandBus } from "@nestjs/cqrs";
import { Request, Response } from "express";
import { CreateStoreCommentCommand } from "./command/createStoreComment.command";
import { UpdateStoreCommentCommand } from "./command/updateStoreComment.command";
import { UpdateStoreCommentDto } from "./dto/updateStoreCommentDto";
import { DeleteCommentCommand } from "./command/deleteComment.command";
import { CreateProductCommentDto } from "./dto/createProductCommentDto";
import { CreateProductCommentCommand } from "./command/createProductComment.command";

@Controller('comment')
export class CommentController {

    constructor(
        private readonly commandBus: CommandBus,
    ){}

    @Post('store/:id')
    async storeComment(
        @Param("id") id: string,
        @Body() createComment: createStoreCommentDto,
        @Req() req: Request,
        @Res() res: Response
    ) {

          // console.log("USer FORM Request: ", req.user);
            const comment = await this.commandBus.execute(new CreateStoreCommentCommand(req.user , id , createComment.comment, createComment.review ));
        
            return res.status(201).json({...comment});
    }

    @Patch('store/:id')
    async updateStoreComment(
        @Param("id") id: string,
        @Body() updateComment: UpdateStoreCommentDto, // Assuming you have a DTO for this
        @Req() req: Request,
        @Res() res: Response
    ) {
        const { commentId, message, review } = updateComment;

        const updatedComment = await this.commandBus.execute(
            new UpdateStoreCommentCommand(req.user, id, commentId, message, review)
        );

        return res.status(200).json(updatedComment);
    }

    @Delete('/:commentId')
    async deleteStoreComment(
        @Param("commentId") commentId: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const deletedComment = await this.commandBus.execute(
            new DeleteCommentCommand(req.userId!, commentId)
        );

        return res.status(200).json(deletedComment);
    }

    @Post('product/:productId')
    async createProductComment(
        @Param("productId") productId: string,
        @Body() createReviewDto: CreateProductCommentDto,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const { comment, review } = createReviewDto;

        const result = await this.commandBus.execute( new CreateProductCommentCommand(req.user, productId, comment, review));

        return res.status(201).json(result);
    }
}