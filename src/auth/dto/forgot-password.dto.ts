import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

export class ForgotPasswordDto {
   @ApiProperty({
      example: 'estif.kebe@gmail.com',
      description: 'Email address of the user requesting password reset',
   })
   @IsEmail() 
   email: string;
}