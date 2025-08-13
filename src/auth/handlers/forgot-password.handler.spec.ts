//  Steps to take before the test
// Look for external functions and mock them.
// then inside the describe block, we will create a testing module and initialize the handler and dependencies.
//

import { Repository } from 'typeorm';
import { ForgotPasswordHandler } from './forgot-password.handler';
import { Credentials, User, UserRole } from '@/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityLogService } from '@/log/activityLog.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { logAndThrowInternalServerError } from '@/utils/InternalServerError';
import { HttpException } from '@nestjs/common';

//  Here we first mock the utils that are used in the handler
jest.mock('src/utils/generateOtp', () => ({
  generateUniqueToken: jest.fn().mockReturnValue('unique_token'),
}));
jest.mock('@/utils/InternalServerError', () => ({
  logAndThrowInternalServerError: jest.fn(),
}));
describe('ForgotPasswordHandler', () => {
  // here we will import the handler to be tested
  //  and mock the dependencies
  let handler: ForgotPasswordHandler;
  let userRepo: jest.Mocked<Repository<User>>;
  let credentialRepo: jest.Mocked<Repository<Credentials>>;
  let eventEmitter: EventEmitter2;
  let activityLogService: ActivityLogService;

  // Now we will create a testing module and initialize the handler and dependencies
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordHandler,
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Credentials),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
        {
          provide: ActivityLogService,
          useValue: { error: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<ForgotPasswordHandler>(ForgotPasswordHandler);
    userRepo = module.get(getRepositoryToken(User));
    credentialRepo = module.get(getRepositoryToken(Credentials));
    eventEmitter = module.get(EventEmitter2);
    activityLogService = module.get(ActivityLogService);
  });

  //  Our First test will be to check if the handler is defined
  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  //  Here we will test the execute method of the handler( which is the main logic of the handler Happy Path)

  it('should execute forgot password command successfully', async () => {
    const email = 'test@gmail.com';
    userRepo.findOne.mockResolvedValue({
      id: '1',
      email,
      firstName: 'Test',
      lastName: 'User',
    } as User);

    credentialRepo.findOne.mockResolvedValue({
      user: { id: '1' },
      temporaryToken: null,
      tokenExpiresAt: null,
    } as Credentials);

    const command = {
      email,
    } as any; // Mock command

    const result = await handler.execute(command);

    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email } });
    expect(credentialRepo.findOne).toHaveBeenCalledWith({
      where: { user: { id: '1' } },
    });
    expect(credentialRepo.save).toHaveBeenCalledWith({
      user: { id: '1' },
      temporaryToken: 'unique_token',
      tokenExpiresAt: expect.any(Date), // Date object
    });

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'user.passwordResetRequested',
      {
        user: { id: '1', email, firstName: 'Test', lastName: 'User' },
        temporaryToken: 'unique_token',
        expiresAt: expect.any(String), // Date string
      },
    );
  });

  //  Here we will test the execute method of the handler (Error Path)
  it('should throw an error if user is not found', async () => {
    const email = 'test@gmail.com';
    userRepo.findOne.mockResolvedValue(null);

    const command = {
      email,
    } as any; // Mock command

    await handler.execute(command);

    expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
      expect.any(HttpException),
      'ForgotPasswordHandler',
      'Auth/ForgotPassword',
      activityLogService,
      expect.any(Object),
    );
  });


    it('should throw an error if credentials are not found', async () => {
        const email = 'test@gmail.com';
        userRepo.findOne.mockResolvedValue({
            id: '1',
            email,
            firstName: 'Test',
            lastName: 'User',
            role: UserRole.CUSTOMER,
        } as User);
        credentialRepo.findOne.mockResolvedValue(null);

        const command = {
            email,
        } as any; // Mock command

        await handler.execute(command);

        expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email } });
        expect(credentialRepo.findOne).toHaveBeenCalledWith({
            where: { user: { id: '1' } },
        })
        expect(activityLogService.error).toHaveBeenCalledWith(
            `Creadential Not Found For User with email: ${email}`,
            'Auth/ForgotPassword',
            email,
            expect.any(String), // User role
            { userId: '1' },
        );
        expect(logAndThrowInternalServerError).toHaveBeenCalledWith(
            expect.any(HttpException),
            'ForgotPasswordHandler',
            'Auth/ForgotPassword',
            activityLogService,
            expect.any(Object),
        );
    })
});
