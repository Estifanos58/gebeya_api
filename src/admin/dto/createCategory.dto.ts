import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({
        example: 'Electronics',
        description: 'Name of the category to be created',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Category for all electronic products',
        description: 'Description of the category',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    description: string;
}