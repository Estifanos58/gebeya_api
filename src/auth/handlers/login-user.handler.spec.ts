import { logAndThrowInternalServerError } from '@/utils/InternalServerError';
import { LoginUserHandler } from './login-user.handler';
import { Credentials, User } from '@/entities';
import { Repository } from 'typeorm';
import { ActivityLogService } from '@/log/activityLog.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Response } from 'express';
import { comparePassword } from '@/utils/hashedPassword';
import { generateJWTToken, storeTokenInCookie } from '@/utils/generateToken';
import { HttpException } from '@nestjs/common';

// Mock external Functions
jest.mock('src/utils/hashedPassword', () => ({
  comparePassword: jest.fn().mockResolvedValue(true),
}));
jest.mock('src/utils/generateToken', () => ({
  generateJWTToken: jest.fn().mockReturnValue('mock_token'),
  storeTokenInCookie: jest.fn(),
}));
jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));
describe('LoginUserHandler', () => {
  let handler: LoginUserHandler;
  let userRepo: jest.Mocked<Repository<User>>;
  let credentialRepo: jest.Mocked<Repository<Credentials>>;
  let activityLogService: ActivityLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserHandler,
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Credentials),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
        {
          provide: ActivityLogService,
          useValue: { error: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<LoginUserHandler>(LoginUserHandler);
    userRepo = module.get(getRepositoryToken(User));
    credentialRepo = module.get(getRepositoryToken(Credentials));
    activityLogService = module.get<ActivityLogService>(ActivityLogService);
  });

  const mockResponse: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as Partial<Response>;
  // First test for Happy path

  it('should login user if valid input is given', async () => {
    const dto = {
      email: 'test@gmail.com',
      password: '123456',
      res: mockResponse as Response,
    };

    userRepo.findOne.mockResolvedValue({
      id: '1',
      email: dto.email,
      firstName: 'Estif',
      lastName: 'Kebe',
    } as User);

    credentialRepo.findOne.mockResolvedValue({
      id: '1',
      password: dto.password,
    } as Credentials);

    const result = await handler.execute(dto);
    // console.log(result)

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
    expect(credentialRepo.findOne).toHaveBeenCalledWith({
      where: { user: { id: '1' } },
    });
    expect(comparePassword).toHaveBeenCalled();
    expect(generateJWTToken).toHaveBeenCalledTimes(2);
    expect(storeTokenInCookie).toHaveBeenCalledTimes(2);
    expect(credentialRepo.save).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'User logged in successfully',
      user: expect.any(Object),
    });
  });

  it('should throw an HttpExeption if User not found', async () => {
    const dto = {
      email: 'test@gmail.com',
      password: '123456',
      res: mockResponse as Response,
    };

    userRepo.findOne.mockResolvedValue({} as User)

    await handler.execute(dto);
    expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
        expect.any(HttpException),
        'LoginUserHandler',
        "Auth/Login",
        activityLogService,
        expect.any(Object)
    )
  });
});
