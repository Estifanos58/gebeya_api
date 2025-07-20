import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserCommand } from "../commands/create-user.command";
import { InjectRepository } from "@nestjs/typeorm";
import { User, UserRole } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { hashedPassword } from "src/utils/hashedPassword";
import { generateOtp } from "src/utils/generateOtp";
import { MailService } from "src/mail/mail.service";
import { generateJWTTokenAndStore } from "src/utils/generateToken";
import { WELCOME_OTP_TEMPLATE } from "src/utils/templates";

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    constructor(@InjectRepository(User) private readonly userRepo: Repository<User> , private readonly mailService: MailService) {}

    async execute(command: CreateUserCommand): Promise<any> {
        // Destructure the  Props
        const { email, password: userPassword, firstName, lastName, role, res } = command;

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

        generateJWTTokenAndStore(user.id, user.email, user.role, res!);
        const token = generateOtp();

        // Send OTP to the user via email
        const html = WELCOME_OTP_TEMPLATE;
        const mail = {
            to: user.email,
            subject: 'Welcome to Our Service',
            html: html,
            placeholders: {
                name: user.firstName,
                otp: user.otp.toString(),
                expiresAt: user.otpExpires_at.toLocaleString(), // Format the date as needed
                year: new Date().getFullYear().toString(),
            } 
        }
        await this.mailService.sendOtp(mail)

        
        // Exclude password from the response
        const { password, otp, otpExpires_at, ...userWithoutPassword } = user

        return {
            message: 'User created successfully',
            data: userWithoutPassword 
        }
        } catch (error) {
            throw new HttpException({message: "Error creating user",
                error: error.message}, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
