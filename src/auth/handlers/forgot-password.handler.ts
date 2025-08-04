import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from '../commands/forgot-password.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Credentials, User } from '@/entities';
import { In, Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { generateUniqueToken } from 'src/utils/generateOtp';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordCommand>
{
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Credentials)
    private readonly credential: Repository<Credentials>,
    private readonly eventEmitter: EventEmitter2,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<any> {
    const { email } = command;

    let currentUser: User | null = null;
    try {
      // Here you would typically find the user by email and update their password
      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        throw new HttpException(
          { message: 'User not Found' },
          HttpStatus.NOT_FOUND,
        );
      }

      currentUser = user;
      // we will generate a unique token for the user
      const temporaryToken = generateUniqueToken();
      const credentials = await this.credential.findOne({
        where: { user: { id: user.id } },
      });
      if (!credentials) {
        this.activityLogService.error(
          `Creadential Not Found For User with email: ${user.email}`,
          'Auth/ForgotPassword',
          user.email,
          user.role,
          { userId: user.id },
        );
        throw new HttpException(
          { message: 'Credentials not found for the user' },
          HttpStatus.NOT_FOUND,
        );
      }
      // Set the temporary token and its expiration time
      credentials.temporaryToken = temporaryToken;
      credentials.tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // Token valid for 15 minutes

      await this.credential.save(credentials);

      // Emit an event for password reset request
      this.eventEmitter.emit('user.passwordResetRequested', {
        user: user,
        temporaryToken: temporaryToken,
        expiresAt: credentials.tokenExpiresAt.toLocaleString(),
      });

      return {
        message: 'Password reset email sent successfully',
      };
    } catch (error) {
      // Log the error and throw an internal server error
      logAndThrowInternalServerError(
        error,
        'ForgotPasswordHandler',
        'Auth/ForgotPassword',
        this.activityLogService,
        { userId: currentUser?.id, role: currentUser?.role, email: currentUser?.email }, // Actor info can be adjusted as needed
      )
    }
  }
}
