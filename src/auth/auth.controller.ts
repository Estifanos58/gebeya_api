import { Body, Controller, Post, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './commands/create-user.command';
import { loginDto } from './dto/login-user.dto';
import { Response } from 'express';
import {  generateJWTTokenAndStore } from 'src/utils/generateToken';
import { LoginUserCommand } from './commands/login-user.command';

@Controller('auth')
export class AuthController {
    constructor( private readonly commandBus: CommandBus, private readonly queryBus: QueryBus){}
    // Sign Up

    @Post('signup')
    async signUp(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
        // Logic for user registration
        const user = await this.commandBus.execute(new CreateUserCommand(
            createUserDto.email,
            createUserDto.password,
            createUserDto.firstName,
            createUserDto.lastName,
            createUserDto.role,
            createUserDto.phoneNumber,
            createUserDto.address,
            createUserDto.profilePicture,
            createUserDto.age
        ))

        generateJWTTokenAndStore(user.user.id, user.user.email, user.user.role, res);
       
        return {
            message: 'User created successfully',
            user
        };
    }

    @Post('login')
    async login(@Body() loginDto: loginDto, @Res() res: Response) {
        // Logic for user login
        const user = await this.commandBus.execute(new LoginUserCommand(
            loginDto.email,
            loginDto.password
        ));

        // Generate JWT token
        const token = generateJWTTokenAndStore(user.user.id, user.user.email, user.user.role, res);

        return {
            message: 'User logged in successfully',
            user: {
                ...user.user,
                token
            }
        };
    }
}
