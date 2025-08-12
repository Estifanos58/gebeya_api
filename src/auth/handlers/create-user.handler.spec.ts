import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserHandler } from './create-user.handler';
import { CreateUserCommand } from '../commands/create-user.command';
import { Repository } from 'typeorm';
import { User, Credentials, UserRole } from '@/entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityLogService } from '@/log/activityLog.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';

// Mock utils
jest.mock('src/utils/hashedPassword', () => ({
  hashedPassword: jest.fn().mockResolvedValue('hashed_pw'),
}));
jest.mock('src/utils/generateOtp', () => ({
  generateOtp: jest.fn().mockReturnValue(123456),
}));
jest.mock('src/utils/generateToken', () => ({
  generateJWTToken: jest.fn().mockReturnValue('mock_token'),
  storeTokenInCookie: jest.fn(),
}));
jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let userRepo: jest.Mocked<Repository<User>>;
  let credentialRepo: jest.Mocked<Repository<Credentials>>;
  let eventEmitter: EventEmitter2;
  let activityLogService: ActivityLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(Credentials),
          useValue: { save: jest.fn() },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
        {
          provide: ActivityLogService,
          useValue: { info: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<CreateUserHandler>(CreateUserHandler);
    userRepo = module.get(getRepositoryToken(User));
    credentialRepo = module.get(getRepositoryToken(Credentials));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    activityLogService = module.get<ActivityLogService>(ActivityLogService);
  });

  it('should create a new user successfully', async () => {
    const mockRes = { cookie: jest.fn() } as any;
    userRepo.findOne.mockResolvedValue(null); // no existing user
    userRepo.save.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
    } as User);
    credentialRepo.save.mockResolvedValue({
      otp: 123456,
      otpExpires_at: new Date(),
    } as Credentials);

    const command = new CreateUserCommand(
      'test@example.com',
      'password123',
      'John',
      'Doe',
      UserRole.CUSTOMER,
      {} as any, // req
      mockRes
    );

    const result = await handler.execute(command);

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(userRepo.save).toHaveBeenCalled();
    expect(credentialRepo.save).toHaveBeenCalled();
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'user.registered',
      expect.any(Object),
    );
    expect(activityLogService.info).toHaveBeenCalledWith(
      'New User Registered',
      'User/Registration',
      'test@example.com',
      UserRole.CUSTOMER,
      { userId: '1' },
    );
    expect(result).toEqual({
      message: 'User created successfully',
      data: expect.objectContaining({ email: 'test@example.com' }),
    });
  });


  it('should handle unexpected errors with logAndThrowInternalServerError', async () => {
    userRepo.findOne.mockRejectedValue(new Error('DB connection failed'));

    const command = new CreateUserCommand(
      'test@example.com',
      'password123',
      'John',
      'Doe',
      UserRole.CUSTOMER,
      { ip: '127.0.0.1' } as any,
      {} as any
    );

    await handler.execute(command);

    expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
      expect.any(Error),
      'CreateUserHandler',
      'User/Registration',
      activityLogService,
      { ip: undefined, email: 'test@example.com' },
    );
  });
});
