import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"

export class createStoreCommentDto {
    @ApiProperty({
        example: 'This store has great products!',
        description: 'Comment text for the store',
        required: true,
    })
    @IsString()
    comment: string

    @ApiProperty({
        example: 4,
        description: 'Rating for the store, should be between 1 and 5',
        required: true,
    })
    @IsNumber()
    review: number
}