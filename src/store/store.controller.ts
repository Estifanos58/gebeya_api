import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { CreateStoreDto } from './dto/createStore.dto';
import { Roles } from '@/decorator/roles.decorator';
import { Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateStoreCommand } from './command/createStore.command';
import { DeleteStoreCommand } from './command/deleteStore.command';
import { UserRole } from '@/entities';
import { GetAllStoreQuery, StoreOrder } from './query/get-all-stores.query';
import { GetStoreQuery } from './query/get-store.query';
import { ApiResponse } from '@nestjs/swagger';

@Controller('store')
@Roles([UserRole.MERCHANT, UserRole.ADMIN]) // Example roles, adjust as necessary
export class StoreController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Store created successfully',
  })
  async createStore(
    @Body() body: CreateStoreDto,
    @Req() req: Request,
  ): Promise<any> {
    // Logic to create a store
    return await this.commandBus.execute(
      new CreateStoreCommand(
        req.userId!,
        body.storeName,
        body.location,
        body.phoneNumber,
      ),
    );
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns all stores',
  })
  async findAll(
    @Query('name') name?: string,
    @Query('orderBy') orderBy?: StoreOrder,
    @Query('sortBy') sortBy: 'ASC' | 'DESC' = 'ASC',
    @Query('isVerified') isVerified: boolean | null = null,
    @Query('banned') banned: boolean | null = null,
  ) {
    return await this.queryBus.execute(new GetAllStoreQuery(name, orderBy, sortBy, isVerified, banned));
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Returns a specific store by ID',
  })
  async findOne(@Param('id') id: string) {
    // console.log("id: ", id)
    return await this.queryBus.execute(new GetStoreQuery(id));
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Store deleted successfully',
  })
  async deleteStore(@Param('id') id: string, @Req() req: Request) {
    return await this.commandBus.execute(new DeleteStoreCommand(id, req.user));
  }
}
