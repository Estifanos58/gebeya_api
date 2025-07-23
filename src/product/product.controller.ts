import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
import { Request, Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { CreateProductCommand } from './command/createProduct.command';
import { Roles } from '@/decorator/roles.decorator';
import { UserRole } from '@/entities';

@Controller('product')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus
  ) {}

  @Roles([UserRole.MERCHANT]) // Example roles, adjust as necessary
  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Req() req: Request, @Res() res: Response) {
    const product = await this.commandBus.execute(new CreateProductCommand(createProductDto.name, createProductDto.description, createProductDto.cover, req.user.id, createProductDto.storeId, createProductDto.skus));
    return res.status(201).json(product);
  }

  @Get()
  findAll() {
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
  }
}
