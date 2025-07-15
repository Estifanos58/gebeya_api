import { ICommandHandler } from '@nestjs/cqrs';
import { VerifyOtpCommand } from '../commands/verifyOtp.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user';
import { Repository } from 'typeorm';

export class VerifyOtpHandler implements ICommandHandler<VerifyOtpCommand> {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async execute(command: VerifyOtpCommand): Promise<any> {
    try {
      const { user, otp: userOtp } = command;

      // Check if the OTP matches the user's stored OTP
      if (user.otp !== userOtp) {
        throw new HttpException(
          { message: 'Invalid OTP' },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if the OTP has expired
      if (new Date() > user.otpExpires_at) {
        throw new HttpException(
          { message: 'Otp Expired' },
          HttpStatus.BAD_REQUEST,
        );
      }

      // If OTP is valid, update user's email verification status
      user.isEmailVerified = true;

      // Here you would typically save the updated user to the database
      await this.userRepo.save(user);

      const { password, otp, otpExpires_at, ...userWithoutSensitiveData } =
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
