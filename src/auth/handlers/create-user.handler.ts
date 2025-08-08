import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../commands/create-user.command';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityType, Credentials, User, UserRole } from '@/entities';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { hashedPassword } from 'src/utils/hashedPassword';
import { generateOtp } from 'src/utils/generateOtp';
import { generateJWTToken, storeTokenInCookie } from 'src/utils/generateToken';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRegisterEvent } from '../event/user_register.event';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Credentials)
    private readonly credential: Repository<Credentials>,
    private readonly eventEmitter: EventEmitter2,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: CreateUserCommand): Promise<any> {
    // Destructure the  Props
    const {
      email,
      password: userPassword,
      firstName,
      lastName,
      role,
      req,
      res,
    } = command;

    try {
      // Find if the user already exists
      const existingUser = await this.userRepo.findOne({ where: { email } });
      if (existingUser) {
        throw new HttpException(
          { message: 'User already exists' },
          HttpStatus.ALREADY_REPORTED,
        );
      }

      // Hash Password
      const hashed = await hashedPassword(userPassword);

      const userRole = Object.values(UserRole).includes(role)
        ? role
        : UserRole.CUSTOMER;
      const generatedotp = generateOtp();

      const user = await this.userRepo.save({
        email,
        firstName,
        lastName,
        role: userRole,
        isEmailVerified: false, // Default to false, will be updated after email verification
      });

      const accessToken = generateJWTToken(
        user.id,
        user.email,
        user.role,
        false,
      );
      const refreshToken = generateJWTToken(
        user.id,
        user.email,
        user.role,
        true,
      );

      // Set the access and refersh token in the response cookie
      storeTokenInCookie(res!, accessToken, false);
      storeTokenInCookie(res!, refreshToken, true);

      const credentials = await this.credential.save({
        user: user,
        password: hashed,
        otp: generatedotp,
        otpExpires_at: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
        refreshToken: refreshToken,
        refreshTokenExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Refresh token valid for 15 days
      });

      this.eventEmitter.emit(
        'user.registered',
        new UserRegisterEvent(
          user,
          credentials?.otp.toString(),
          credentials.otpExpires_at.toLocaleString(),
        ),
      );

      this.activityLogService.info(
        'New User Registered',
        'User/Registration',
        user.email,
        user.role,
        { userId: user.id },
      );
      // Exclude password from the response
      const { ...userWithoutPassword } = user;

      return {
        message: 'User created successfully',
        data: userWithoutPassword,
      };
    } catch (error) {

      logAndThrowInternalServerError(
        error,
        'CreateUserHandler',
        'User/Registration',
        this.activityLogService,
        {ip:req?.ip,email}, // Actor info can be adjusted as needed
      )
    }
  }
}
