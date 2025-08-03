import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  generateJWTToken,
  storeTokenInCookie,
  verifyToken,
} from '@/utils/generateToken';
import { InjectRepository } from '@nestjs/typeorm';
import { Credentials, User } from '@/entities';
import { Repository } from 'typeorm';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Credentials)
    private readonly credRepo: Repository<Credentials>,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<any> {
    const { req, res } = command;
    const refresh_token = req.cookies.refreshToken;

    if (!refresh_token) {
      throw new HttpException(
        { message: 'refresh_token Not Found' },
        HttpStatus.BAD_REQUEST,
      );
    }

    let userId: string;

    try {
      userId = verifyToken(refresh_token);
    } catch (err) {
      throw new HttpException(
        { message: 'Invalid or expired refresh token' },
        HttpStatus.FORBIDDEN,
      );
    }

    const credential = await this.credRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    // console.log("CREDENTIALS : ", credential)

    if (
      !credential ||
      !credential.refreshToken ||
      credential.refreshToken !== refresh_token
    ) {
      throw new HttpException(
        { message: 'Invalid Refresh Token' },
        HttpStatus.FORBIDDEN,
      );
    }

    // Generate new tokens
    const accessToken = generateJWTToken(
      userId,
      credential.user.email,
      credential.user.role,
      false,
    );
    const newRefreshToken = generateJWTToken(
      userId,
      credential.user.email,
      credential.user.role,
      true,
    );

    // Store tokens in cookies
    storeTokenInCookie(res, accessToken, false);
    storeTokenInCookie(res, newRefreshToken, true);

    // Update credential record
    credential.refreshToken = newRefreshToken;
    credential.refreshTokenExpiresAt = new Date(
      Date.now() + 15 * 24 * 60 * 60 * 1000,
    );

    await this.credRepo.save(credential);

    return {
      message: 'Token refreshed successfully',
    };
  }
}
