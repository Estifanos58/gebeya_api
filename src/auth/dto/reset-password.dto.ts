import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class ResetPasswordDto {
    // @IsStrongPassword()
    @IsNotEmpty()
    newPassword: string;
}