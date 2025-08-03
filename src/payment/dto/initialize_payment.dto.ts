import { Order, Store } from "@/entities";
import { IsOptional, IsPositive, IsString, IsUUID } from "class-validator";

export class InitializePaymentDto {
    @IsOptional()
    @IsString()
    first_name: string;

    @IsOptional()
    @IsString()
    last_name: string;

    @IsOptional()
    @IsString()
    email: string;

    @IsOptional()
    @IsString()
    currency: string;

    @IsUUID()
    orderId: Order['id']

    @IsUUID()
    storeId: Store['id']
}