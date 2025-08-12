import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let mockResponse: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any as Response;
  });

  describe('signUp', () => {
    it('should call CreateUserCommand and return created user', async () => {
      const dto = {
        email: 'test@example.com',
        password: '123456',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        phoneNumber: '12345',
        address: 'Somewhere',
        profilePicture: '',
        age: 25,
      };
      const expectedUser = { id: '1', ...dto };
      (commandBus.execute as jest.Mock).mockResolvedValue(expectedUser);

      await controller.signUp(dto as any, {} as Request, mockResponse);

      expect(commandBus.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedUser);
    });

    it('should handle errors from CommandBus', async () => {
      (commandBus.execute as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        controller.signUp({} as any, {} as Request, mockResponse),
      ).rejects.toThrow('DB error');
    });
  });

  describe('login', () => {
    it('should call LoginUserCommand and return logged in user', async () => {
      const dto = { email: 'test@example.com', password: '123456' };
      const expectedUser = { token: 'jwt' };
      (commandBus.execute as jest.Mock).mockResolvedValue(expectedUser);

      await controller.login(dto as any, mockResponse);

      expect(commandBus.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedUser);
    });
  });

  describe('verifyOtp', () => {
    it('should return 400 if OTP is invalid', async () => {
      await controller.verifyOtp(
        { otp: 123 } as any,
        {} as Request,
        mockResponse,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid OTP',
      });
    });

    it('should call VerifyOtpCommand when OTP is valid', async () => {
      const req = { user: { id: '1' } } as unknown as Request;
      const otpValid = { success: true };
      (commandBus.execute as jest.Mock).mockResolvedValue(otpValid);

      await controller.verifyOtp({ otp: 123456 } as any, req, mockResponse);

      expect(commandBus.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(otpValid);
    });

    it('should handle errors when CommandBus fails', async () => {
      const req = { user: { id: '1' } } as unknown as Request;
      (commandBus.execute as jest.Mock).mockRejectedValue(
        new Error('OTP service down'),
      );

      await expect(
        controller.verifyOtp({ otp: 123456 } as any, req, mockResponse),
      ).rejects.toThrow('OTP service down');
    });
  });

  describe('forgotPassword', () => {
    it('should call ForgotPasswordCommand', async () => {
      const dto = { email: 'test@example.com' };
      const result = { success: true };
      (commandBus.execute as jest.Mock).mockResolvedValue(result);

      await controller.forgotPassword(dto as any, mockResponse);

      expect(commandBus.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return 404 if email is not found', async () => {
      (commandBus.execute as jest.Mock).mockRejectedValue(
        new HttpException({ message: 'User not Found' }, HttpStatus.NOT_FOUND),
      );

      await expect(
        controller.forgotPassword(
          { email: 'no@user.com' } as any,
          mockResponse,
        ),
      ).rejects.toThrow('User not Found');
    });
  });

  describe('resetPassword', () => {
    it('should throw if token or email is missing', async () => {
      await expect(
        controller.resetPassword(
          '',
          '',
          { newPassword: '123456' } as any,
          mockResponse,
        ),
      ).rejects.toThrow('Empty Fields Found');
    });

    it('should call ResetPasswordCommand when data is valid', async () => {
      const result = { success: true };
      (commandBus.execute as jest.Mock).mockResolvedValue(result);

      await controller.resetPassword(
        'token',
        'test@example.com',
        { newPassword: '123456' } as any,
        mockResponse,
      );

      expect(commandBus.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });
  });

  describe('refreshToken', () => {
    it('should call RefreshTokenCommand', async () => {
      const result = { newToken: 'abc' };
      (commandBus.execute as jest.Mock).mockResolvedValue(result);

      await controller.refreshToken({} as Request, mockResponse);

      expect(commandBus.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return 401 if token is invalid', async () => {
      (commandBus.execute as jest.Mock).mockRejectedValue(
        new HttpException(
          { message: 'refresh_token Not Found' },
          HttpStatus.BAD_REQUEST,
        ),
      );

      await expect(
        controller.refreshToken({} as Request, mockResponse),
      ).rejects.toThrow(
        new HttpException(
          { message: 'refresh_token Not Found' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('getUserData', () => {
    it('should call GetUserQuery', async () => {
      const result = { id: '1', name: 'John Doe' };
      (queryBus.execute as jest.Mock).mockResolvedValue(result);

      await controller.getUserData(
        { user: { id: '1' } } as unknown as Request,
        mockResponse,
      );

      expect(queryBus.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return 404 if user not found', async () => {
      (queryBus.execute as jest.Mock).mockRejectedValue(
        new HttpException({ message: 'User Not Found' }, HttpStatus.NOT_FOUND),
      );

      await expect(
        controller.getUserData(
          { user: { id: '999' } } as unknown as Request,
          mockResponse,
        ),
      ).rejects.toThrow(
        new HttpException({ message: 'User Not Found' }, HttpStatus.NOT_FOUND),
      );
    });
  });
});
