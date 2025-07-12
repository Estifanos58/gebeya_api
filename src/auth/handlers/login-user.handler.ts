import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LoginUserCommand } from "../commands/login-user.command";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { comparePassword } from "src/utils/hashedPassword";

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand>{

    constructor(@InjectRepository(User) private readonly userRepo: Repository<User>){}

    async execute(command: LoginUserCommand): Promise<any> {
        const { email, password } = command;

        // Logic to authenticate user

        const user = await this.userRepo.findOne({ where: { email } });

        // Check if user exists
        if(!user){
            throw new HttpException({ message: "Invalid Creadential" }, HttpStatus.NOT_FOUND);
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await comparePassword(password, user.password);
        
        if(!isPasswordValid){
            throw new HttpException({ message: "Invalid Creadential" }, HttpStatus.UNAUTHORIZED);
        }

        // If the password is valid, return user details (excluding password)
        const { password: _, ...userWithoutPassword } = user; // Exclude password from

        return {
            message: 'User logged in successfully',
            user: {
                userWithoutPassword,
            }
        };
    }
}