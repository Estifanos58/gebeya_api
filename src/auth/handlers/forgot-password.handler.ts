import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from '../commands/forgot-password.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Credentials, User } from '@/entities';
import { In, Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { generateUniqueToken } from 'src/utils/generateOtp';
import { EventEmitter2 } from '@nestjs/event-emitter';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordCommand>
{
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Credentials) private readonly credential: Repository<Credentials>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<any> {
    try {
      const { email } = command;

      // Here you would typically find the user by email and update their password
      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        throw new HttpException(
          { message: 'User not Found' },
          HttpStatus.NOT_FOUND,
        );
      }
      // we will generate a unique token for the user
      const temporaryToken = generateUniqueToken();
      const credentials = await this.credential.findOne({ where: { user: { id: user.id } } });
      if (!credentials) {
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
        expiresAt: credentials.tokenExpiresAt.toLocaleString()
      });


      return {
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
