import { IsEmail, IsStrongPassword } from "class-validator";

export class ForgotPasswordDto {
   @IsEmail() 
   email: string;
}