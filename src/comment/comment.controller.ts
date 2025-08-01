import { Body, Controller, Param, Post, Req, Res } from "@nestjs/common";
import { createStoreCommentDto } from "./dto/createStoreCommentDto";
import { CommandBus } from "@nestjs/cqrs";
import { Request, Response } from "express";
import { CreateStoreCommentCommand } from "./command/createStoreComment.command";

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
}