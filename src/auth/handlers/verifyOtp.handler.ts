import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyOtpCommand } from '../commands/verifyOtp.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Credentials, User } from '@/entities';
import { Repository } from 'typeorm';
import { ActivityLogService } from '@/log/activityLog.service';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

@CommandHandler(VerifyOtpCommand)
export class VerifyOtpHandler implements ICommandHandler<VerifyOtpCommand> {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Credentials)
    private readonly credential: Repository<Credentials>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: VerifyOtpCommand): Promise<any> {
    const { user, otp: userOtp } = command;

    let currentUser: User | null = null;

    try {
      const creadentials = await this.credential.findOne({
        where: { user: { id: user.id } },
        relations: ['user'],
      });

      if (!creadentials) {
        this.activityLogService.error(
          `Creadential Not Found For User with email: ${user.email}`,
          'Auth/VerifyOtp',
          user.email,
          user.role,
          { userId: user.id },
        );
        throw new HttpException(
          { message: 'Credentials not found for the user' },
          HttpStatus.NOT_FOUND,
        );
      }

      currentUser = creadentials.user;
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
        this.credential.save(creadentials),
      ]);

      const { ...userWithoutSensitiveData } = user;

      return {
        message: 'OTP verified successfully',
        data: userWithoutSensitiveData,
      };
    } catch (error) {
      // Log the error and throw an internal server error
      logAndThrowInternalServerError(
        error,
        'VerifyOtpHandler',
        'Auth/VerifyOtp',
        this.activityLogService,
        { userId: currentUser?.id, role: currentUser?.role, email: currentUser?.email }, // Actor info can be adjusted as needed
      )
    }
  }
}
