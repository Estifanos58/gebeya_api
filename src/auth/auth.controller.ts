import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './commands/create-user.command';
import { loginDto } from './dto/login-user.dto';
import { Response, Request } from 'express';
import {  generateJWTTokenAndStore } from 'src/utils/generateToken';
import { LoginUserCommand } from './commands/login-user.command';
import { VerifyOtpCommand } from './commands/verifyOtp.command';
import { MailService } from 'src/mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ForgotPasswordCommand } from './commands/forgot-password.command';

// Extend the Request interface to include 'user'
declare module 'express' {
    export interface Request {
        user?: any;
    }
}

@Controller('auth')
export class AuthController {
    constructor( private readonly commandBus: CommandBus, private readonly mailService: MailService){}
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
            createUserDto.age,
            res
        ))
       
        return res.status(201).json({ 
            message: 'User created successfully',
            user
        })
    }

    @Post('login')
    async login(@Body() loginDto: loginDto, @Res() res: Response) {
        // Logic for user login
        const user = await this.commandBus.execute(new LoginUserCommand(
            loginDto.email,
            loginDto.password,
            res
        ));
        return res.status(200).json({
            message: 'User logged in successfully',
            data: user 
        });
    }

    @Post('verify-otp')
    async verifyOtp(@Body() body: {otp: number}, @Req() req: Request, @Res() res: Response) {
        const { otp } = body;
        if(!otp || typeof otp !== 'number' || otp.toString().length !== 6) {
            return res.status(400).json({ message: 'Invalid OTP' });  
        }  
        const user = req.user; // Assuming user is attached to the request in a real scenario 
        const otpValid = await this.commandBus.execute(new VerifyOtpCommand(user,otp));
       
        return res.status(200).json(otpValid)
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto, @Res() res: Response) {
        const {email} = body;
        const emailSent = await this.commandBus.execute(new ForgotPasswordCommand(email));

        return res.status(200).json(emailSent)
    }
}

