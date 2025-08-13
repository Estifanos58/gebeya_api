import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * This is a **unit test** for the AuthController.
 * - Unit tests focus on testing the controller's logic in isolation.
 * - We do not call real services, databases, or external APIs.
 * - Instead, we **mock** CommandBus and QueryBus so no actual commands or queries are executed.
 * - This keeps tests fast, predictable, and focused.
 */

describe('AuthController', () => {
  // Declare variables for the controller and its dependencies.
  // These will be reinitialized before each test to keep them fresh.
  let controller: AuthController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let mockResponse: Response;

  /**
   * beforeEach runs before every single test inside this describe block.
   * This ensures no test accidentally reuses state from a previous test.
   */
  beforeEach(async () => {
    /**
     * Test.createTestingModule creates a fake NestJS module just for testing.
     * - We register the controller we want to test.
     * - We provide mocked versions of its dependencies.
     * Without this step, we couldn't use NestJS's DI (Dependency Injection) in tests.
     */
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        // CommandBus and QueryBus are part of NestJS CQRS pattern.
        // We replace them with simple Jest mocks so we can control the output.
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    }).compile(); // compile() finalizes the module and makes it ready to use.

    // Get instances of the controller and dependencies from NestJS DI container.
    controller = module.get<AuthController>(AuthController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);

    /**
     * We create a fake Response object.
     * - mockReturnThis() makes methods chainable like res.status().json().
     * Without this, our controller's res.status(...).json(...) calls would fail.
     */
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
  });

  /**
   * ============================
   *  SIGNUP TESTS
   * ============================
   */
  describe('signUp', () => {
    it('should call CreateUserCommand and return created user', async () => {
      // ARRANGE: Prepare input DTO and expected output.
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

      // Mock commandBus to return our expected user instead of running real logic.
      (commandBus.execute as jest.Mock).mockResolvedValue(expectedUser);

      // ACT: Call the controller method.
      await controller.signUp(dto as any, {} as Request, mockResponse);

      // ASSERT: Verify correct behavior.
      expect(commandBus.execute).toHaveBeenCalled(); // Command executed
      expect(mockResponse.status).toHaveBeenCalledWith(201); // Correct HTTP status
      expect(mockResponse.json).toHaveBeenCalledWith(expectedUser); // Correct payload
    });

    it('should handle errors from CommandBus', async () => {
      // ARRANGE: Simulate database or service failure.
      (commandBus.execute as jest.Mock).mockRejectedValue(new Error('DB error'));

      // ASSERT: Expect method to throw the same error.
      await expect(
        controller.signUp({} as any, {} as Request, mockResponse),
      ).rejects.toThrow('DB error');
    });
  });

  /**
   * ============================
   *  LOGIN TESTS
   * ============================
   */
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

  /**
   * ============================
   *  VERIFY OTP TESTS
   * ============================
   */
  describe('verifyOtp', () => {
    it('should return 400 if OTP is invalid', async () => {
      await controller.verifyOtp(
        { otp: 123 } as any, // Invalid OTP
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

  /**
   * ============================
   *  FORGOT PASSWORD TESTS
   * ============================
   */
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

  /**
   * ============================
   *  RESET PASSWORD TESTS
   * ============================
   */
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

  /**
   * ============================
   *  REFRESH TOKEN TESTS
   * ============================
   */
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

  /**
   * ============================
   *  GET USER DATA TESTS
   * ============================
   */
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
