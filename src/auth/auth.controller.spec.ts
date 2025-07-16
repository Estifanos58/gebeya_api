import { CommandBus } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './entities/user';

describe('AuthController', () => {
  let authController: AuthController;
  let commandBus: CommandBus;

  const mockCommandBus = {
    execute: jest.fn(),
  };


  beforeEach(async () => {
    const module:TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        }
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
        phoneNumber: '1234567890',
        address: 'Somewhere',
        profilePicture: null,
        age: 25,
      };

      const expectedResponse = {
        message: 'User created successfully',
        data: {
          id: 1,
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          role: createUserDto.role,
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

      // ACT
      const result = await authController.signUp(createUserDto, res);

      // ASSERT
       expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
            email: createUserDto.email,
            password: createUserDto.password,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            role: createUserDto.role,
            phoneNumber: createUserDto.phoneNumber,
            address: createUserDto.address,
            profilePicture: createUserDto.profilePicture,
            age: createUserDto.age,
            res,
        }));
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(expectedResponse);
      expect(result).toEqual(expectedResponse);
    });
  });
});
