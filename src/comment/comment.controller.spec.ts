import { CommandBus } from "@nestjs/cqrs";
import { CommentController } from "./comment.controller"
import { Test, TestingModule } from "@nestjs/testing";
import { CreateStoreCommentCommand } from "./command/createStoreComment.command";
import { Request } from "express";
import { UpdateStoreCommentDto } from "./dto/updateStoreCommentDto";
import { CreateProductCommentDto } from "./dto/createProductCommentDto";
import { User } from "@/entities";
import { UpdateStoreCommentCommand } from "./command/updateStoreComment.command";
import { DeleteCommentCommand } from "./command/deleteComment.command";
import { CreateProductCommentCommand } from "./command/createProductComment.command";

describe('CommentController', ()=>{
    let controller: CommentController;
    let commandBus: CommandBus;

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentController],
            providers: [
                {
                    provide: CommandBus,
                    useValue: {
                        execute: jest.fn()
                    }
                }
            ]
        }).compile()

        controller = module.get<CommentController>(CommentController);
        commandBus = module.get<CommandBus>(CommandBus);
    })

    it('should create a store comment command', async ()=> {
        const req = {user: {id: 'userId'} as User} as Request;
        const dto = {comment: 'Test Comment', review: 3}
        const id = 'storeId'
        
        jest.spyOn(commandBus, 'execute').mockResolvedValue({
            status: 201,
            message: 'Comment Created'
        })

        const result = await controller.storeComment(id, dto, req);

        expect(commandBus.execute).toHaveBeenCalledWith(new CreateStoreCommentCommand(req.user, id, dto.comment, dto.review))
        expect(result).toEqual({
            status: 201,
            message: 'Comment Created'
        })
    })

    it('should create an update comment Command', async ()=>{
        const id = 'storeId';
        const updateDto = { commentId: 'commentId', message: 'Test Comment', review: 3} as UpdateStoreCommentDto ;
        const req = {user: {id: 'userId'} } as Request

        jest.spyOn(commandBus, 'execute').mockResolvedValue({
            status: 200,
            message: 'Comment Updated'
        })

        const result = await controller.updateStoreComment(id, updateDto, req)

        expect(commandBus.execute).toHaveBeenCalledWith(
            new UpdateStoreCommentCommand(req.user, id, updateDto.commentId, updateDto.message, updateDto.review)
        )
        expect(result).toEqual({
            status: 200,
            message: 'Comment Updated'
        })
    })

    it('should create a Delete Comment Command', async ()=>{
        const commentId = 'commentId';
        const req = {userId: 'userId'} as Request;

        jest.spyOn(commandBus, 'execute').mockResolvedValue({
            status: 200,
            message: 'comment Deleted'
        })

        const result = await controller.deleteStoreComment(commentId, req);

        expect(commandBus.execute).toHaveBeenCalledWith(new DeleteCommentCommand(req.userId, commentId))
        expect(result).toEqual({
            status: 200,
            message: 'comment Deleted'
        })
    })

    it('should create a Product Comment Command', async ()=>{
        const productId = 'productId';
        const dto = { comment: 'Test Comment', review: 3} as CreateProductCommentDto
        const req = { user: { id: 'userId'}} as Request

        jest.spyOn(commandBus, 'execute').mockResolvedValue({
            status: 201,
            message: 'product comment Added'
        })

        const result = await controller.createProductComment(productId, dto, req)

        expect(commandBus.execute).toHaveBeenCalledWith(
            new CreateProductCommentCommand(req.user, productId, dto.comment, dto.review)
        )
        expect(result).toEqual({
            status: 201,
            message: 'product comment Added'
        })
    })
})