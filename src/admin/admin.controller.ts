import { Roles } from '@/decorator/roles.decorator';
import { UserRole } from '@/entities';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApproveStoreDto } from './dto/approve_store.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApproveStoreCommand } from './command/approve_store.command';
import { Request, Response } from 'express';
import { BannedStoreDto } from './dto/banned_store.dto';
import { BanStoreCommand } from './command/ban_store.command';
import { UnBanStoreCommand } from './command/upban_store.command';
import { UserBanCommand } from './command/ban_user.command';
import { UserUnbanCommand } from './command/unban_user.command';
import { GetUsersQuery } from './query/get_users.query';

@Controller('admin')
@Roles([UserRole.ADMIN])
export class AdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('store/:storeId')
  async approveStore(
    @Param('storeId') storeId: string,
    @Body() approveStoreDto: ApproveStoreDto,
    @Req() req: Request,
  ): Promise<any> {
    return this.commandBus.execute(
      new ApproveStoreCommand(storeId, approveStoreDto.isApproved, req.user),
    );
  }

  @Post('store/ban/:storeId')
  async banStore(
    @Param('storeId') storeId: string,
    @Body() bannedStoreDto: BannedStoreDto,
    @Req() req: Request,
  ) {
    return this.commandBus.execute(
      new BanStoreCommand(storeId, bannedStoreDto.reason, req.user),
    );
  }

  @Post('store/unban/:storeId')
  async unbanStore(
    @Param('storeId') storeId: string,
    @Req() req: Request,
  ): Promise<any> {
    return this.commandBus.execute(new UnBanStoreCommand(storeId, req.user));
  }

  @Post('user/ban/:userId')
  async banUser(@Param('userId') userId: string): Promise<any> {
    return this.commandBus.execute(new UserBanCommand(userId));
  }

  @Post('user/unban/:userId')
  async unbanUser(@Param('userId') userId: string): Promise<any> {
    return this.commandBus.execute(new UserUnbanCommand(userId));
  }

  @Get('users')
  async getUsers(
    @Query('search') search: string = '',
    @Query('role') role: UserRole | null = null,
    @Query('status') status: boolean | null = null,
    @Query('order') order: 'asc' | 'desc' = 'desc',
    @Query('banned') banned: boolean | null = null,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Res() res: Response,
  ): Promise<any> {
    return this.queryBus.execute(
      new GetUsersQuery(search, role, status, order, banned, page, limit),
    );
  }
}
