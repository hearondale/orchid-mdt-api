import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = { login: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('delegates the key to AuthService.login and returns the token', async () => {
      authService.login.mockResolvedValue({ access_token: 'jwt.token' });

      const result = await controller.login({ key: 'handshake-key' });

      expect(authService.login).toHaveBeenCalledWith('handshake-key');
      expect(result).toEqual({ access_token: 'jwt.token' });
    });

    it('propagates errors thrown by AuthService', async () => {
      authService.login.mockRejectedValue(new Error('Unauthorized'));

      await expect(controller.login({ key: 'bad-key' })).rejects.toThrow(
        'Unauthorized',
      );
    });
  });
});
