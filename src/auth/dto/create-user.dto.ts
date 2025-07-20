import { UserRole } from "@/entities";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum, IsInt, Min } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;

    @IsOptional()
    @IsString()
    phoneNumber?: string | null;

    @IsOptional()
    @IsString()
    address?: string | null;

    @IsOptional()
    @IsString()
    profilePicture?: string | null;

    @IsOptional()
    @IsInt()
    age?: number | null;
}