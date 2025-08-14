import { User } from '@/entities';
import { GetUserHandler } from './get-user.handler';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('GetUserHandler', () => {
  let handler: GetUserHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetUserHandler],
    }).compile();

    handler = module.get<GetUserHandler>(GetUserHandler);
  });

  it('should retrieve the user from middleware and send it', async () => {
    const user = { id: '1', email: 'test@gmail.com' } as User;

    const query = { user };

    const result = await handler.execute(query);

    expect(result).toEqual({
      message: 'User data retrieved successfully',
      data: user,
    });
  });

  it('should throw an error if no user is sent from the middleware', async () => {
  const user = {} as User;
  const query = { user };

  await expect(handler.execute(query)).rejects.toThrow(
    new HttpException({ message: "User Not Found" }, HttpStatus.NOT_FOUND)
  );
});
});
