import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../commands/reset-password.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Credentials, User } from '@/entities';
import { Repository } from 'typeorm';
import { hashedPassword } from 'src/utils/hashedPassword';
import { PASSWROD_RESET_SUCCESS_TEMPLATE } from 'src/utils/templates';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Credentials)
    private readonly credential: Repository<Credentials>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<any> {
    const { token, email, newPassword, res } = command;

    let currentUser: User | null = null;

    try {
      const user = await this.userRepo.findOne({
        where: { email },
      });

      if (!user) {
        throw new HttpException(
          { message: 'Invalid or expired token' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      currentUser = user;
      const creadentials = await this.credential.findOne({
        where: { user: { id: user.id }, temporaryToken: token },
      });

      if (!creadentials) {
        this.activityLogService.error(
          `Creadential Not Found For User with email: ${user.email}`,
          'Auth/ResetPassword',
          user.email,
          user.role,
          { userId: user.id },
        );
        throw new HttpException(
          { message: 'Credentials For this User Not Found' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Check if the token is still valid
      if (
        creadentials?.tokenExpiresAt &&
        creadentials?.tokenExpiresAt < new Date()
      ) {
        throw new HttpException(
          { message: 'Token has expired' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const hashed = await hashedPassword(newPassword);
      // Update the user's password
      creadentials.password = hashed;
      creadentials.temporaryToken = null; // Clear the temporary token
      creadentials.tokenExpiresAt = null; // Clear the token expiration time

      // Save the updated credentials
      await this.credential.save(creadentials);

      const link = `https://yourapp.com/support`;
      const html = PASSWROD_RESET_SUCCESS_TEMPLATE;
      const mail = {
        to: user.email,
        subject: 'Password Reset Request',
        html: html,
        placeholders: {
          name: user.firstName,
          date: new Date().toLocaleDateString,
          supportLink: link, // Format the date as needed
          year: new Date().getFullYear().toString(),
        },
      };

      const { ...userWithoutSensitiveData } = user;

      this.activityLogService.info(
        'User Has Reset His/Her Password',
        'Auth/ResetPassword',
        user.email,
        user.role,
        { userId: user.id },
      );

      return {
        message: 'Password reset successfully',
        data: userWithoutSensitiveData,
      };
    } catch (error) {
      // Log the error and throw an internal server error
      logAndThrowInternalServerError(
        error,
        'ResetPasswordHandler',
        'Auth/ResetPassword',
        this.activityLogService,
        { userId: currentUser?.id, role: currentUser?.role, email: currentUser?.email }, 
      );
    }
  }
}
