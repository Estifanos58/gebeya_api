import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '@/entities';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateCategoryCommand } from '../command/createCategory.command';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryCommand>
{
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<any> {
    const { name, description } = command;

    try {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name },
      });

      if (existingCategory) {
        throw new HttpException(
          `Category with name ${name} already exists`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const category = this.categoryRepository.create({
        name,
        description,
      });

      await this.categoryRepository.save(category);

      return {
        message: 'Category created successfully',
        data: category,
      };
    } catch (error) {
        logAndThrowInternalServerError(
            error,
            'CreateCategoryHandler',
            'Create Category Command',
            this.activityLogService
        )
    }
  }
}
