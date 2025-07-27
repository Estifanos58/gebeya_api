import { Cart, User } from "@/entities";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateOrderDto {

  @IsUUID()
  cartId: Cart['id'];

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;
}