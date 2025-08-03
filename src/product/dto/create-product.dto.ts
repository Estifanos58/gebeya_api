import { Size, Store } from "@/entities"
import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Skus } from "../command/createProduct.command";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto{


     @ApiProperty({
           example: 'Product Name',
           description: 'Name of the product',
           required: true,
     })
     @IsNotEmpty()
     @IsString()
     name: string;

     @ApiProperty({
               example: 'This is a detailed description of the product.',
               description: 'Detailed description of the product',
               required: true,
     })
     @IsNotEmpty()
     @IsString()
     description: string;

     @ApiProperty({
          example: 'https://example.com/image.jpg',
          description: 'URL of the product cover image',
          required: true,
     })
     @IsNotEmpty()
     @IsString()
     cover: string;


     @ApiProperty({
          example: 'categoryId123',
          description: 'Unique identifier for the product category',
          required: true,
     })
     @IsNotEmpty()
     @IsString()
     categoryId: string;

     @ApiProperty({
          example: 'sizeId123',
          description: 'Unique identifier for the product size',
          required: true,
     })
     @IsNotEmpty()
     @IsUUID()
     storeId: Store["id"];

     @ApiProperty({
          example: '{ "size": "lg", "price": 20, "color": "black" "quantity": 10 }',
          description: 'Array of product SKUs with size and quantity',
          required: true,
     })
     @IsArray()
     @IsNotEmpty({ each: true})
     skus: Array<Skus>
}