import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './commands/create-user.command';
import { loginDto } from './dto/login-user.dto';
import { Response, Request } from 'express';
import { LoginUserCommand } from './commands/login-user.command';
import { VerifyOtpCommand } from './commands/verifyOtp.command';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ForgotPasswordCommand } from './commands/forgot-password.command';
import { ResetPasswordCommand } from './commands/reset-password.command';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GetUserQuery } from './queries/get-user-query';
import { RefreshTokenCommand } from './commands/refresh-token.command';
import { UserRole } from '@/entities';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

// Extend the Request interface to include 'user'
declare module 'express' {
    export interface Request {
        user?: any;
        userId?: string; // Optional: if you want to attach userId as well
        userRole?: UserRole; // Optional: if you want to attach userRole
    }
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor( 
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ){}
    // Sign Up

    @Post('signup')
    @ApiResponse({
        status: 201,
        description: 'User created successfully',
        type: CreateUserDto
    })
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
       
        return res.status(201).json({...user})
    }

    @Post('login')
    @ApiResponse({
        status: 200,
        description: 'User logged in successfully',
        type: loginDto
    })
    async login(@Body() loginDto: loginDto, @Res() res: Response) {
        // Logic for user login
        const user = await this.commandBus.execute(new LoginUserCommand(
            loginDto.email,
            loginDto.password,
            res
        ));
        return res.status(200).json({...user});
    }

    @Post('verify-otp')
    @ApiResponse({
        status: 200,
        description: 'OTP verified successfully',
        type: Object // Adjust the type as per your response structure
    })
    async verifyOtp(@Body() body: {otp: number}, @Req() req: Request, @Res() res: Response) {
        const { otp } = body;
        if(!otp || typeof otp !== 'number' || otp.toString().length !== 6) {
            return res.status(400).json({ message: 'Invalid OTP' });  
        }  
        const user = req.user; // Assuming user is attached to the request in a real scenario 
        const otpValid = await this.commandBus.execute(new VerifyOtpCommand(user,otp));
       
        return res.status(200).json({...otpValid})
    }

    @Post('forgot-password')
    @ApiResponse({
        status: 200,
        description: 'Password reset email sent successfully',
        type: Object // Adjust the type as per your response structure
    })
    async forgotPassword(@Body() body: ForgotPasswordDto, @Res() res: Response) {
        const {email} = body;
        const emailSent = await this.commandBus.execute(new ForgotPasswordCommand(email));

        return res.status(200).json({...emailSent})
    }

    @Post('reset-password')
    @ApiResponse({
        status: 200,
        description: 'Password reset successfully',
        type: ResetPasswordDto // Adjust the type as per your response structure
    })
    async resetPassword(@Query('token') token: string, @Query('email') email: string, @Body() body: ResetPasswordDto, @Res() res: Response) {
        // Logic to reset password using the token and email
        if(!token || !email) {
            throw new HttpException({message: "Empty Fields Found"}, HttpStatus.BAD_REQUEST);
        }
        console.log({"Token: ": token, "Email: ": email})
        // This would typically involve validating the token and updating the user's password
        // For simplicity, let's assume we have a service that handles this
       const user= await this.commandBus.execute(new ResetPasswordCommand(token, email, body.newPassword, res));
       
        return res.status(200).json({...user});
    }

    @Get("refresh-token")
    @ApiResponse({
        status: 200,
        description: 'Token refreshed successfully',
        type: Object // Adjust the type as per your response structure
    })
    async refreshToken(@Req() req: Request, @Res() res: Response){
        const user = await this.commandBus.execute(new RefreshTokenCommand(req, res))

        res.status(200).json({...user});
    }

    @Get("me")
    @ApiResponse({
        status: 200,
        description: 'User data retrieved successfully',
        type: Object // Adjust the type as per your response structure
    })
    async getUserData(@Req() req: Request, @Res() res: Response){
        const user = await this.queryBus.execute(new GetUserQuery(req.user))
        res.status(200).json({...user});
    }
}

