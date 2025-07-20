import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../commands/reset-password.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entities';
import { Repository } from 'typeorm';
import { hashedPassword } from 'src/utils/hashedPassword';
import { PASSWROD_RESET_SUCCESS_TEMPLATE } from 'src/utils/templates';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<any> {
    const { token, email, newPassword, res } = command;
    try {
      const user = await this.userRepo.findOne({
        where: { email, temporaryToken: token },
      });

      if (!user) {
        throw new HttpException(
          { message: 'Invalid or expired token' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Check if the token is still valid
      if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) {
        throw new HttpException(
          { message: 'Token has expired' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const hashed = await hashedPassword(newPassword);
      // Update the user's password
      user.password = hashed;
      user.temporaryToken = null; // Clear the temporary token
      user.tokenExpiresAt = null; // Clear the token expiration time

      await this.userRepo.save(user);

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

      const {password, otp, otpExpires_at, tokenExpiresAt, temporaryToken, ...userWithoutSensitiveData } = user
      
      return userWithoutSensitiveData;
    } catch (error) {
      // Handle errors appropriately, e.g., user not found, token expired, etc.
      throw new HttpException(
        { message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
