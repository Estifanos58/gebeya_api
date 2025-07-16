import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class ResetPasswordDto {
    @IsStrongPassword()
    newPassword: string;
}