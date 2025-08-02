import { IsNumber, IsString } from "class-validator";

export class CreateProductCommentDto {
    @IsString()
    comment: string;

    @IsNumber()
    review: 1 | 2 | 3 | 4 
}