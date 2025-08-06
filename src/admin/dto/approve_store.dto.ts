import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class ApproveStoreDto {

    @ApiProperty({
        description: 'Indicates whether the store is approved or not',
        example: true,
        required: true
    })
    @IsNotEmpty()
    @IsBoolean()
    isApproved: boolean;
}