import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LoginUserCommand } from "../commands/login-user.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Credentials, User } from "@/entities";
import { In, Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { comparePassword } from "src/utils/hashedPassword";
import { generateJWTTokenAndStore } from "src/utils/generateToken";

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand>{

    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Credentials) private readonly credential: Repository<Credentials>,
    ){}

    async execute(command: LoginUserCommand): Promise<any> {
        const { email, password, res } = command;

        // Logic to authenticate user

        const user = await this.userRepo.findOne({ where: { email } });

        // Check if user exists
        if(!user){
            throw new HttpException({ message: "Invalid Credential" }, HttpStatus.UNAUTHORIZED);
        }
        
        // Find credentials associated with the user
        const credentials = await this.credential.findOne({ where: { user: { id: user.id } } });
        if(!credentials){
            throw new HttpException({ message: "Credentials not found for the user" }, HttpStatus.NOT_FOUND);
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await comparePassword(password, credentials.password);
        
        if(!isPasswordValid){
            throw new HttpException({ message: "Invalid Credential" }, HttpStatus.UNAUTHORIZED);
        }

          // Generate JWT token
        const token = generateJWTTokenAndStore(user.id, user.email, user.role, res);


        // If the password is valid, return user details (excluding password)
        const {...userWithoutSensetiveData } = user; // Exclude password from

        return {
            message: 'User logged in successfully',
            user: {
                userWithoutSensetiveData,
            }
        };
    }
}