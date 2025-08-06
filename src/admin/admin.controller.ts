import { Roles } from '@/decorator/roles.decorator';
import { UserRole } from '@/entities';
import { Body, Controller, Param, Post, Query, Req, Res } from '@nestjs/common';
import { ApproveStoreDto } from './dto/approve_store.dto';
import { CommandBus } from '@nestjs/cqrs';
import { ApproveStoreCommand } from './command/approve_store.command';
import { Request, Response } from 'express';
import { BannedStoreDto } from './dto/banned_store.dto';
import { BanStoreCommand } from './command/ban_store.command';

@Controller('admin')
@Roles([UserRole.ADMIN])
export class AdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('store')
  async approveStore(
    @Query('storeId') storeId: string,
    @Body() approveStoreDto: ApproveStoreDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const store = await this.commandBus.execute(
      new ApproveStoreCommand(storeId, approveStoreDto.isApproved, req.user),
    );
    return res.status(200).json({ ...store });
  }

  @Post('store/ban/:storeId')
  async banStore( 
    @Param('storeId') storeId: string,
    @Body() bannedStoreDto: BannedStoreDto,
    @Req() req: Request,
    @Res() res: Response,
  ){
    const store = await this.commandBus.execute(
      new BanStoreCommand(storeId, bannedStoreDto.reason, req.user),
    );
    return res.status(200).json({ ...store });
  }
}
