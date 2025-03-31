import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from '../../application/use-cases/user/registerUser.useCase';
import { LoginUserUseCase } from '../../application/use-cases/user/loginUser.useCase';
import { HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUserUseCase: RegisterUserUseCase;
  let loginUserUseCase: LoginUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RegisterUserUseCase,
          useValue: {
            execute: jest.fn(() => Promise.resolve()),
          },
        },
        {
          provide: LoginUserUseCase,
          useValue: {
            execute: jest.fn(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    registerUserUseCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    loginUserUseCase = module.get<LoginUserUseCase>(LoginUserUseCase);
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: { id: 1 },
      };

      const executeSpy = jest.spyOn(registerUserUseCase, 'execute');
      executeSpy.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResponse);
      expect(executeSpy).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.name,
      );
    });

    it('should handle registration errors', async () => {
      const errorResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'User already exists',
        error: 'Bad Request',
      };

      const executeSpy = jest.spyOn(registerUserUseCase, 'execute');
      executeSpy.mockRejectedValue(errorResponse);

      await expect(controller.register(registerDto)).rejects.toEqual(
        errorResponse,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: { access_token: 'jwt-token' },
      };

      const executeSpy = jest.spyOn(loginUserUseCase, 'execute');
      executeSpy.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(executeSpy).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should handle login errors', async () => {
      const errorResponse = {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      };

      const executeSpy = jest.spyOn(loginUserUseCase, 'execute');
      executeSpy.mockRejectedValue(errorResponse);

      await expect(controller.login(loginDto)).rejects.toEqual(errorResponse);
    });
  });
});
