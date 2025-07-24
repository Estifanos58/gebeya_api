import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Request, Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProductCommand } from './command/createProduct.command';
import { Roles } from '@/decorator/roles.decorator';
import { UserRole } from '@/entities';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductCommand } from './command/updateProduct.command';
import { DeleteProductCommand } from './command/deleteProduct.command';

@Controller('product')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Roles([UserRole.MERCHANT]) // Example roles, adjust as necessary
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const product = await this.commandBus.execute(
      new CreateProductCommand(
        createProductDto.name,
        createProductDto.description,
        createProductDto.cover,
        req.user.id,
        createProductDto.storeId,
        createProductDto.categoryId,
        createProductDto.skus,
      ),
    );
    return res.status(201).json(product);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: Request, @Res() res: Response) {
    const updatedProduct = await this.commandBus.execute(
      new UpdateProductCommand(
        id,
        updateProductDto.name!,
        updateProductDto.description!,
        updateProductDto.cover!,
        req.userId!, // Assuming userId is part of the DTO
        updateProductDto.categoryId!, // Assuming categoryId is part of the DTO
        updateProductDto.skus!, // Assuming skus is part of the DTO
      ),
    );
    return res.status(200).json({...updatedProduct});
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const product = await this.commandBus.execute(new DeleteProductCommand(req.userId!, id));
    return res.status(200).json({...product});
  }
}
