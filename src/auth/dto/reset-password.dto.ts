import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class ResetPasswordDto {
    // @IsStrongPassword()
    @ApiProperty({
        example: 'StrongPassword123!',
        description: 'New password for the user',
        required: true,
    })
    @IsNotEmpty()
    newPassword: string;
}