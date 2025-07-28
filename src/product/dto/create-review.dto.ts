import { IsNumber, IsString } from "class-validator";

export class CreateReviewDto {
    @IsString()
    comment: string;

    @IsNumber()
    review: 1 | 2 | 3 | 4 | 5
}