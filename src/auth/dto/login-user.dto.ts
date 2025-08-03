import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class loginDto {
    @ApiProperty({
        example: 'estif.kebe@gmail.com',
        description: 'Email address of the user logging in',
        required: true,
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;


    @ApiProperty({
        example: 'StrongPassword123!',
        description: 'Password of the user logging in',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}