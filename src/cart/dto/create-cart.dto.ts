import { IsNotEmpty, IsString } from "class-validator";

export class CreateCartDto {
  @IsString()
  @IsNotEmpty()
  productSkuId: string;

  @IsNotEmpty()
  quantity: number; // should be positive (> 0)
}
