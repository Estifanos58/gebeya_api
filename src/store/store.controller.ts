import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { CreateStoreDto } from './dto/createStore.dto';
import { Roles } from '@/decorator/roles.decorator';
import { Request, Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateStoreCommand } from './command/createStore.command';
import { DeleteStoreCommand } from './command/deleteStore.command';
import { UserRole } from '@/entities';
import { GetAllStoreQuery } from './query/get-all-stores.query';
import { GetStoreQuery } from './query/get-store.query';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { CreateCategoryCommand } from './command/createCategory.command';
import { createCommentDto } from './dto/createComment.dto';
import { CreateCommentCommand } from './command/createComment.command';

@Controller('store')
@Roles([UserRole.MERCHANT, UserRole.ADMIN]) // Example roles, adjust as necessary
export class StoreController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createStore(
    @Body() body: CreateStoreDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    // Logic to create a store
    const store = await this.commandBus.execute(
      new CreateStoreCommand(
        req.userId!,
        body.storeName,
        body.location,
        body.phoneNumber,
      ),
    );
    return res.status(201).json({ ...store });
  }

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const store = await this.queryBus.execute(new GetAllStoreQuery());
    return res.status(200).json({ ...store });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // console.log("id: ", id)
    const store = await this.queryBus.execute(new GetStoreQuery(id));
    return res.status(200).json({ ...store });
  }

  @Delete(':id')
  async deleteStore(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const store = await this.commandBus.execute(
      new DeleteStoreCommand(id, req.user),
    );

    return res.status(200).json({ ...store });
  }

  @Post(":id/comment")
  async createComment (
    @Param("id") id: string,
    @Body() createComment: createCommentDto,
    @Req() req: Request,
    @Res() res: Response
  ){
    // console.log("USer FORM Request: ", req.user);
    const comment = await this.commandBus.execute(new CreateCommentCommand(req.user , id , createComment.comment, createComment.review ));

    return res.status(201).json({...comment});
  }

  @Roles([UserRole.MERCHANT])
  @Post('category')
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const category = await this.commandBus.execute(
      new CreateCategoryCommand(
        createCategoryDto.name,
        createCategoryDto.description,
      ),
    );
    return res.status(201).json(category);
  }
}
