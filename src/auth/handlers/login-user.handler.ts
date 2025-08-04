import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserCommand } from '../commands/login-user.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Credentials, User } from '@/entities';
import { In, Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { comparePassword } from 'src/utils/hashedPassword';
import { generateJWTToken, storeTokenInCookie } from 'src/utils/generateToken';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Credentials)
    private readonly credential: Repository<Credentials>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: LoginUserCommand): Promise<any> {
    const { email, password, res } = command;

    let currentUser: User | null = null;

    try {
      const user = await this.userRepo.findOne({ where: { email } });

      // Check if user exists
      if (!user) {
        throw new HttpException(
          { message: 'Invalid Credential' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      currentUser = user;

      // Find credentials associated with the user
      const credentials = await this.credential.findOne({
        where: { user: { id: user.id } },
      });
      if (!credentials) {
        this.activityLogService.error(
          `Creadential Not Found For User with email: ${user.email}`,
          'Auth/Login',
          user.email,
          user.role,
          { userId: user.id },
        );
        throw new HttpException(
          { message: 'Credentials not found for the user' },
          HttpStatus.NOT_FOUND,
        );
      }

      // Compare the provided password with the stored hashed password
      const isPasswordValid = await comparePassword(
        password,
        credentials.password,
      );

      if (!isPasswordValid) {
        throw new HttpException(
          { message: 'Invalid Credential' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Generate JWT token
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

      // Set the access and refresh token in the response cookie
      storeTokenInCookie(res!, accessToken, false);
      storeTokenInCookie(res!, refreshToken, true);

      credentials.refreshToken = refreshToken;
      credentials.refreshTokenExpiresAt = new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000,
      ); // Refresh token valid for 15 days

      await this.credential.save(credentials);

      // If the password is valid, return user details (excluding password)
      const { ...userWithoutSensetiveData } = user; // Exclude password from

      return {
        message: 'User logged in successfully',
        user: userWithoutSensetiveData,
      };
    } catch (error) {
      // Log the error and throw an internal server error
      logAndThrowInternalServerError(
        error,
        'LoginUserHandler',
        'Auth/Login',
        this.activityLogService,
        { userId: currentUser?.id, role: currentUser?.role, email: currentUser?.email }, // Actor info can be adjusted as needed
      );
    }
  }
}
