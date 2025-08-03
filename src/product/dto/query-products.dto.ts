import { ApiProperty } from "@nestjs/swagger";
import { ProductSortBy } from "../query/get-products.query";
import { Category, Store } from "@/entities";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class QueryProductsDto {
    @ApiProperty({
        example: '12345',
        description: 'Unique identifier for the store',
        required: false,
    })
    @IsNotEmpty()
    @IsUUID()
    storeId?: Store['id']

    @ApiProperty({
      example: '12345',
      description: 'Unique identifier for the category',
      required: false,
    })
    @IsNotEmpty()
    @IsUUID()
    categoryId?: Category['id']

    @ApiProperty({
        example: 'createdAt',
        description: 'Field to sort products by',
        required: false,
        enum: ProductSortBy,
    })
    sortBy?: ProductSortBy

    @ApiProperty({
        example: 'ASC',
        description: 'Sort order for the products',
        required: false,
        enum: ['ASC', 'DESC'],
    })
    @IsOptional()
    @IsString()
    @IsEnum(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC'

    @ApiProperty({
        example: 1,
        description: 'Page number for pagination',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    page?: number; 

    @ApiProperty({
        example: 10,
        description: 'Number of products per page for pagination',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    limit?: number

    @ApiProperty({
        example: 'Product Name',
        description: 'Name of the product to search for',
        required: false,
    })
    @IsOptional()
    @IsString()
    name?: string

    @ApiProperty({
      example: 10,
      description: 'Minimum price range for filtering products',
      required: false,
    })
    @IsOptional()
    @IsNumber()
    minRange?: number

    @ApiProperty({
      example: 40,
      description: 'Maximum price range for filtering products',
      required: false
    })
    @IsOptional()
    @IsNumber()
    maxRange?: number
}