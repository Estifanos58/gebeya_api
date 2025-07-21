import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyOtpCommand } from '../commands/verifyOtp.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Credentials, User } from '@/entities';
import { Repository } from 'typeorm';


@CommandHandler(VerifyOtpCommand)
export class VerifyOtpHandler implements ICommandHandler<VerifyOtpCommand> {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Credentials) private readonly credential: Repository<Credentials>,
  ) {}

  async execute(command: VerifyOtpCommand): Promise<any> {
    try {
      const { user, otp: userOtp } = command;

      const creadentials = await this.credential.findOne({
        where: { user: { id: user.id } },
      });

      if (!creadentials) {
        throw new HttpException(
          { message: 'Credentials not found for the user' },
          HttpStatus.NOT_FOUND,
        );
      }
      // Check if the OTP matches the user's stored OTP
      if (creadentials.otp !== userOtp) {
        throw new HttpException(
          { message: 'Invalid OTP' },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if the OTP has expired
      if (new Date() > creadentials.otpExpires_at!) {
        throw new HttpException(
          { message: 'Otp Expired' },
          HttpStatus.BAD_REQUEST,
        );
      }

      // If OTP is valid, update user's email verification status
      user.isEmailVerified = true;
      creadentials.otp = null; // Clear the OTP after successful verification
      creadentials.otpExpires_at = null; // Clear the OTP expiration time

      // Here you would typically save the updated user to the database
      await Promise.all([
        this.userRepo.save(user),
        this.credential.save(creadentials)
      ]);

      const {...userWithoutSensitiveData } =
        user;

      return {
        message: 'OTP verified successfully',
        data: userWithoutSensitiveData,
      };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new HttpException(
            { message: 'Error verifying OTP', error: error.message },
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
