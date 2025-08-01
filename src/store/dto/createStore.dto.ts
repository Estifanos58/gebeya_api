import { User } from "@/entities";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateStoreDto {
    
    @IsNotEmpty()
    @IsString()
    storeName: string;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    
}