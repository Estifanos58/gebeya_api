import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateStoreCommentDto{
    @ApiProperty({
        example: '12345',
        description: 'Unique identifier for the comment to be updated',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    commentId: string;

    @ApiProperty({
        example: 'This store has great service!',
        description: 'Updated comment text for the store',
        required: false,
    })
    @IsString()
    @IsOptional()
    message?: string;

    @ApiProperty({
        example: 4,
        description: 'Updated rating for the store, should be between 1 and 5',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    review?: 1 | 2 | 3 | 4;
}