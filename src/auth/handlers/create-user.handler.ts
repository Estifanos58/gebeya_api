import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserCommand } from "../commands/create-user.command";
import { InjectRepository } from "@nestjs/typeorm";
import { User, UserRole } from "../entities/user";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { hashedPassword } from "src/utils/hashedPassword";
import { generateOtp } from "src/utils/generateOtp";

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

    async execute(command: CreateUserCommand): Promise<any> {
        // Destructure the  Props
        const { email, password: userPassword, firstName, lastName, role } = command;

        try {
               // Find if the user already exists
        const existingUser = await this.userRepo.findOne({ where: { email } });
        if(existingUser){
            throw new HttpException({message: "User already exists"}, HttpStatus.ALREADY_REPORTED);
        }

        // Hash Password
        const hashed = await hashedPassword(userPassword);

        const userRole = Object.values(UserRole).includes(role) ? role : UserRole.CUSTOMER;
        const generatedotp = generateOtp();

        const user = await this.userRepo.save({
            email,
            password: hashed,
            firstName,
            lastName,
            role: userRole,
            otp: generatedotp,
            otpExpires_at: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
            isEmailVerified: false // Default to false, will be updated after email verification
        })


        
        // Exclude password from the response
        const { password, otp, otpExpires_at, ...userWithoutPassword } = user

        return {
            message: 'User created successfully',
            user: userWithoutPassword 
        }
        } catch (error) {
            throw new HttpException({message: "Error creating user",
                error: error.message}, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
