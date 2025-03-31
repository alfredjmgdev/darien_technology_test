import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoginUserUseCase } from './loginUser.useCase';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepositoryPort } from '../../../domain/repositories/user.repository.port';

jest.mock('bcrypt');

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let mockUserRepository: UserRepositoryPort;
  let mockJwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    createdAt: new Date(),
  };

  const loginData = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    } as unknown as JwtService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        {
          provide: 'UserRepositoryPort',
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
  });

  describe('execute', () => {
    it('should successfully login a user', async () => {
      // Arrange
      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwtService.sign as jest.Mock).mockReturnValue('jwt-token');

      // Act
      const result = await useCase.execute(loginData.email, loginData.password);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: {
          access_token: 'jwt-token',
        },
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        loginData.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should throw HttpException when user is not found', async () => {
      // Arrange
      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute(loginData.email, loginData.password),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Invalid credentials',
            error: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        ),
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        loginData.email,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw HttpException when password is invalid', async () => {
      // Arrange
      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        useCase.execute(loginData.email, loginData.password),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Invalid credentials',
            error: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        ),
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        loginData.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw HttpException when repository throws error', async () => {
      // Arrange
      const error = new Error('Database error');
      (mockUserRepository.findByEmail as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        useCase.execute(loginData.email, loginData.password),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error during login',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
