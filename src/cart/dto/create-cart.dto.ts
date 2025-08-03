import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCartDto {
  @ApiProperty({
    example: '12345',
    description: 'Unique identifier for the cart',
  })
  @IsString()
  @IsNotEmpty()
  productSkuId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product to add to the cart',
  })
  @IsNotEmpty()
  quantity: number; // should be positive (> 0)
}
