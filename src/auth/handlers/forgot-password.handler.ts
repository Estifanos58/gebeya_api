import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from '../commands/forgot-password.command';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entities';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { generateUniqueToken } from 'src/utils/generateOtp';
import { PASSWORD_RESET_TEMPLATE } from 'src/utils/templates';
import { MailService } from 'src/mail/mail.service';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordCommand>
{
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
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

      // Set the temporary token and its expiration time
      user.temporaryToken = temporaryToken;
      user.tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // Token valid for 15 minutes

      // send an Email to the user with the reset link
      const link = `https://yourapp.com/reset-password?token=${temporaryToken}&email=${email}`;

      // Send OTP to the user via email
      const html = PASSWORD_RESET_TEMPLATE;
      const mail = {
        to: user.email,
        subject: 'Password Reset Request',
        html: html,
        placeholders: {
          name: user.firstName,
          resetLink: link,
          expiresAt: user.tokenExpiresAt.toLocaleString(), // Format the date as needed
          year: new Date().getFullYear().toString(),
        },
      };

      await this.mailService.sendOtp(mail);
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
