import { Cart, User } from "@/entities";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateOrderDto {

  @ApiProperty({
    example: '12345',
    description: 'Unique identifier for the user placing the order',
    required: true,
  })
  @IsUUID()
  cartId: Cart['id'];

  @ApiProperty({
    example: '123 Main St, City, Country',
    description: 'delivery address for the order',
    required: false,
  })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiProperty({
    example: '+251912345678',
    description: 'Contact information for the order',
    required: false,
  })
  @IsOptional()
  @IsString()
  contactInfo?: string;
}