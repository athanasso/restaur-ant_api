import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { Role } from '../src/enums/Role';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return the result of authService.login', async () => {
      const user = { username: 'testuser', email: 'test@test.gr', password: 'password' };
      const expectedResult: { payload: { username: string; id: number; role: Role; accessToken: string; }; } = { 
        payload: { username: 'testuser', id: 123, role: Role.ADMIN, accessToken: 'jwt_token' },
      };
      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      expect(await authController.login(user)).toBe(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(user);
    });

    it('should throw BadRequestException when authService.login throws it', async () => {
      const user = { username: 'testuser', email: 'test@test.gr', password: 'password' };
      jest.spyOn(authService, 'login').mockRejectedValue(new BadRequestException('Invalid credentials'));

      await expect(authController.login(user)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for other errors', async () => {
      const user = { username: 'testuser', email: 'test@test.gr', password: 'password' };
      jest.spyOn(authService, 'login').mockRejectedValue(new Error('Some error'));

      await expect(authController.login(user)).rejects.toThrow(BadRequestException);
    });
  });

  describe('register', () => {
    it('should return the result of authService.register', async () => {
      const userData = { username: 'newuser', password: 'password', email: 'new@user.com' };
      const expectedResult: { success: boolean; message: string; data: number; } = {
        success: true, message: 'User created', data: 123
      };
      jest.spyOn(authService, 'register').mockResolvedValue(expectedResult);

      expect(await authController.register(userData)).toBe(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(userData);
    });

    it('should throw BadRequestException when authService.register throws it', async () => {
      const userData = { username: 'newuser', password: 'password', email: 'new@user.com' };
      jest.spyOn(authService, 'register').mockRejectedValue(new BadRequestException('User already exists'));

      await expect(authController.register(userData)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for other errors', async () => {
      const userData = { username: 'newuser', password: 'password', email: 'new@user.com' };
      jest.spyOn(authService, 'register').mockRejectedValue(new Error('Some error'));

      await expect(authController.register(userData)).rejects.toThrow(BadRequestException);
    });
  });
});