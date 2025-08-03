import { Order, Store } from "@/entities";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsPositive, IsString, IsUUID } from "class-validator";

export class InitializePaymentDto {
    @ApiProperty({
        example: 'Order12345',
        description: 'Unique identifier for the order to be paid',
        required: true,
    })
    @IsUUID()
    orderId: Order['id']

    @ApiProperty({
        example: 'Store12345',
        description: 'Unique identifier for the store where the order was placed',
        required: true,
    })
    @IsUUID()
    storeId: Store['id']
}