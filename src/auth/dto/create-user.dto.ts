import { UserRole } from "@/entities";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum, IsInt, Min } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        example: 'estif.kebe@gmail.com(should be a valid email)',
        description: 'The email of the user',
        required: true,
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'password123',
        description: 'The password of the user',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        example: 'Estif',
        description: 'The first name of the user',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        example: 'Kebe',
        description: 'The last name of the user',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        example: 'admin',
        description: 'The role of the user(admin | merchant | customer)',
        required: true,
        enum: UserRole,
    })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;

    @ApiProperty({
        example: '1234567890',
        description: 'The phone number of the user',
        required: false,
    })
    @IsOptional()
    @IsString()
    phoneNumber?: string | null;


    @ApiProperty({
        example: '123 Main St, City, Country',
        description: 'The address of the user',
        required: false,
    })
    @IsOptional()
    @IsString()
    address?: string | null;

    @ApiProperty({
        example: 'https://example.com/profile.jpg',
        description: 'The profile picture URL of the user',
        required: false,
    })
    @IsOptional()
    @IsString()
    profilePicture?: string | null;

    @ApiProperty({
        example: 25,
        description: 'The age of the user',
        required: false,
    })
    @IsOptional()
    @IsInt()
    age?: number | null;
}