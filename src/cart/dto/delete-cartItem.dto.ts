import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteCartDto {

    @ApiProperty({
        example: '12345',
        description: 'Unique identifier for the cart item to be deleted',
    })
    @IsString()
    @IsNotEmpty()
    cartItemId: string;
}