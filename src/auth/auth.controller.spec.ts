import { CommandBus } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './entities/user';
import { loginDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let commandBus: CommandBus;

  const mockCommandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a user and return success message', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'secret123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.ADMIN,
      };

      const expectedResponse = {
        message: 'User created successfully',
        data: {
          id: 1,
          ...createUserDto,
          phoneNumber: null,
          address: null,
          profilePicture: null,
          age: null,
        },
      };

      const json = jest.fn().mockReturnValue(expectedResponse);
      const status = jest.fn().mockReturnValue({ json });
      const res = { status } as any;

      mockCommandBus.execute.mockResolvedValue(expectedResponse);

      const result = await authController.signUp(createUserDto, res);

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ ...createUserDto, res }),
      );
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(expectedResponse);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('login', () => {
    it('should login a user and return success message', async () => {
      const loginData: loginDto = {
        email: 'estifkebe@gmail.com',
        password: '123123424242',
      };

      const expectedUser = {
        id: 1,
        email: loginData.email,
        firstName: 'Test',
        lastName: 'User',
      };

      const expectedResponse = {
        message: 'User logged in successfully',
        data: expectedUser,
      };

      const json = jest.fn().mockReturnValue(expectedResponse);
      const status = jest.fn().mockReturnValue({ json });
      const res = { status } as any;

      mockCommandBus.execute.mockResolvedValue(expectedUser);

      const result = await authController.login(loginData, res);

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ ...loginData, res }),
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expectedResponse);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('verifyOtp', () => {
    it('should return 400 for invalid OTP', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const req = { user: {} } as any;

      const result = await authController.verifyOtp({ otp: 123 }, req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid OTP' });
    });

    it('should verify OTP and return success', async () => {
      const req = { user: { id: 1 } } as any;
      const res = {
        status: jest.fn().mockReturnValue({ json: jest.fn() }),
      } as any;
      const otp = 123456;

      mockCommandBus.execute.mockResolvedValue({ message: 'OTP verified' });

      const result = await authController.verifyOtp({ otp }, req, res);

      expect(commandBus.execute).toHaveBeenCalledWith(expect.anything());
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset link', async () => {
      const body: ForgotPasswordDto = { email: 'test@example.com' };
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const res = { status } as any;

      mockCommandBus.execute.mockResolvedValue({ message: 'Email sent' });

      const result = await authController.forgotPassword(body, res);

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: body.email,
        }),
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({ message: 'Email sent' });
    });
  });

  describe('resetPassword', () => {
    it('should throw error for missing token/email', async () => {
      const res = { status: jest.fn(), json: jest.fn() } as any;
      await expect(
        authController.resetPassword(
          undefined as any,
          undefined as any,
          { newPassword: 'pass' },
          res,
        ),
      ).rejects.toThrow();
    });

    it('should reset password and return success', async () => {
      const token = 'valid-token';
      const email = 'test@example.com';
      const body: ResetPasswordDto = { newPassword: 'newpass123' };
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const res = { status } as any;

      mockCommandBus.execute.mockResolvedValue({ id: 1, email });

      const result = await authController.resetPassword(
        token,
        email,
        body,
        res,
      );

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          token,
          email,
          newPassword: body.newPassword,
          res,
        }),
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        message: 'Password reset successfully',
        user: { id: 1, email },
      });
    });
  });
});
