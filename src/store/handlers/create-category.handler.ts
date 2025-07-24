import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { CreateCategoryCommand } from "../command/createCategory.command";

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    async execute(command: CreateCategoryCommand): Promise<Category> {
        const { name, description } = command;

        const existingCategory = await this.categoryRepository.findOne({ where: { name } });
       
        if (existingCategory) {
            throw new HttpException(`Category with name ${name} already exists`, HttpStatus.BAD_REQUEST);
        }
        
        const category = this.categoryRepository.create({
            name,
            description,
        });

        return await this.categoryRepository.save(category);
    }
}