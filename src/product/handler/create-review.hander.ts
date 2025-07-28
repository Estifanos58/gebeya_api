import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateReviewCommand } from "../command/createReview.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Comment, Product } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus, InternalServerErrorException, NotFoundException } from "@nestjs/common";

@CommandHandler(CreateReviewCommand)
export class CreateReviewHandler implements ICommandHandler<CreateReviewCommand>{

    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,

        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>
    ){}

    async execute(command: CreateReviewCommand): Promise<any> {
        const { user, productId, comment: message, review} = command

        try {

            if(![1,2,3,4,5].includes(review)) throw new HttpException("review must be a Number between 1 and 5",HttpStatus.BAD_REQUEST)
            
            const product = await this.productRepository.findOne({
                where: {id: productId}
            })

            if(!product) throw new NotFoundException(`product with this id Not found`)

            const comment = this.commentRepository.create({
                user,
                message,
                review,
                product
            }) 

            await this.commentRepository.save(comment);

            return {
                message: "Comment added Successfully"
            }
        } catch (error) {
            console.error('Error happed at Create Review Handler: ', error.message)
            throw new InternalServerErrorException("Internal Server Error Happened")
        }
    }
}