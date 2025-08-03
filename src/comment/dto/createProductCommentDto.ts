import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateProductCommentDto {
    @ApiProperty({
        example: 'This product is amazing!',
        description: 'Comment text for the product',
        required: true,
    })
    @IsString()
    comment: string;

    @ApiProperty({
        example: 3,
        description: 'Rating for the product, should be between 1 and 4',
        required: true,
    })
    @IsNumber()
    review: 1 | 2 | 3 | 4 
}