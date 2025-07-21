import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../commands/reset-password.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Credentials, User } from '@/entities';
import { Repository } from 'typeorm';
import { hashedPassword } from 'src/utils/hashedPassword';
import { PASSWROD_RESET_SUCCESS_TEMPLATE } from 'src/utils/templates';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Credentials) private readonly credential: Repository<Credentials>,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<any> {
    const { token, email, newPassword, res } = command;
    try {
      const user = await this.userRepo.findOne({
        where: { email},
      });

      if (!user) {
        throw new HttpException(
          { message: 'Invalid or expired token' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const creadentials = await this.credential.findOne({
        where: { user: { id: user.id }, temporaryToken: token },
      });

      if(!creadentials) {
        throw new HttpException({ message: "Credentials For this User Not Found" }, HttpStatus.UNAUTHORIZED);
      }

      // Check if the token is still valid
      if (creadentials?.tokenExpiresAt && creadentials?.tokenExpiresAt < new Date()) {
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

      const {...userWithoutSensitiveData } = user
      
      return {
            message: 'Password reset successfully',
            data: userWithoutSensitiveData
        }
    } catch (error) {
      // Handle errors appropriately, e.g., user not found, token expired, etc.
      throw new HttpException(
        { message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
