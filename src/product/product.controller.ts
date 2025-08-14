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
  Query,
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
import { FindProductQuery } from './query/find-product.query';
import { GetProductsQuery } from './query/get-products.query';
import { QueryProductsDto } from './dto/query-products.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('product')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Retrieve a list of products',
    type: [CreateProductDto], // Adjust the type as necessary
  })
  async findAll(@Query() query: QueryProductsDto) {
    return await this.queryBus.execute(
      new GetProductsQuery(
        query.storeId,
        query.categoryId,
        query.sortBy,
        query.sortOrder,
        query.page,
        query.limit,
        query.name,
        query.minRange,
        query.maxRange,
      ),
    );
  }

  @Roles([UserRole.MERCHANT]) // Example roles, adjust as necessary
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: CreateProductDto, // Adjust the type as necessary
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ) {
    return await this.commandBus.execute(
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
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: UpdateProductDto, // Adjust the type as necessary
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
  ) {
    return await this.commandBus.execute(
      new UpdateProductCommand(
        id,
        updateProductDto.name!,
        updateProductDto.description!,
        updateProductDto.cover!,
        req.userId!,
        updateProductDto.categoryId!, 
        updateProductDto.skus!, 
      ),
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Retrieve a product by ID',
    type: CreateProductDto, // Adjust the type as necessary
  })
  async findOne(
    @Param('id') id: string
  ) { 
    return await this.queryBus.execute(new FindProductQuery(id));
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully', // Adjust the type as necessary
  })
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return await this.commandBus.execute(
      new DeleteProductCommand(req.userId!, id),
    );
  }
}
