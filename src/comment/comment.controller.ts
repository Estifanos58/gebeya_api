import { Body, Controller, Delete, Param, Patch, Post, Req, Res } from "@nestjs/common";
import { createStoreCommentDto } from "./dto/createStoreCommentDto";
import { CommandBus } from "@nestjs/cqrs";
import { Request, Response } from "express";
import { CreateStoreCommentCommand } from "./command/createStoreComment.command";
import { UpdateStoreCommentCommand } from "./command/updateStoreComment.command";
import { UpdateStoreCommentDto } from "./dto/updateStoreCommentDto";
import { DeleteStoreCommentCommand } from "./command/deleteStoreComment.command";

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

    @Delete('store/:id/:commentId')
    async deleteStoreComment(
        @Param("id") id: string,
        @Param("commentId") commentId: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const deletedComment = await this.commandBus.execute(
            new DeleteStoreCommentCommand(req.userId!, id, commentId)
        );

        return res.status(200).json(deletedComment);
    }
}