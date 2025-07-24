import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCommentCommand } from "../command/createComment.command";
import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Store, Comment } from "@/entities";
import { Repository } from "typeorm";
import { ExceptionsHandler } from "@nestjs/core/exceptions/exceptions-handler";

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand>{

    constructor(
        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>,

        @InjectRepository(Comment)
        private readonly commentRepo: Repository<Comment>
    ){}

    async execute(command: CreateCommentCommand): Promise<any> {
        const {userId, storeId, comment: message, review} = command

        try {
            // No Need to See If the user Exists or not b/c the middleware will make sure that the user exists

            const store = await this.storeRepo.find({where: {id: storeId}});
            if(!store) throw new HttpException({message: "Store Not Found"}, HttpStatus.NOT_FOUND)

            const comment = this.commentRepo.create({
                user: {id: userId},
                store: {id: storeId},
                message,
                review
            })

            await this.commentRepo.save(comment)

            return {
                message : "Comment Added",
                data: comment
            }
        } catch (error) {
             throw new HttpException({ message: "Server Issue"}, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}