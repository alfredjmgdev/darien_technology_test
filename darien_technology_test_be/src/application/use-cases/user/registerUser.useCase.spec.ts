import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RegisterUserUseCase } from './registerUser.useCase';
import * as bcrypt from 'bcrypt';
import { UserRepositoryPort } from '../../../domain/repositories/user.repository.port';

jest.mock('bcrypt');

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepository: UserRepositoryPort;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn() as jest.MockedFunction<
        UserRepositoryPort['findByEmail']
      >,
      findById: jest.fn() as jest.MockedFunction<
        UserRepositoryPort['findById']
      >,
      create: jest.fn() as jest.MockedFunction<UserRepositoryPort['create']>,
      update: jest.fn() as jest.MockedFunction<UserRepositoryPort['update']>,
      delete: jest.fn() as jest.MockedFunction<UserRepositoryPort['delete']>,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: 'UserRepositoryPort',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
  });

  describe('execute', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      jest.useFakeTimers();
      const fixedDate = new Date('2025-03-30T02:11:58.384Z');
      jest.setSystemTime(fixedDate);

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      (mockUserRepository.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(
        registerData.email,
        registerData.password,
        registerData.name,
      );

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: { id: mockUser.id },
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        registerData.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerData.email,
        password: 'hashedPassword123',
        name: registerData.name,
        createdAt: fixedDate,
      });

      jest.useRealTimers();
    });

    it('should throw HttpException when user already exists', async () => {
      // Arrange
      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        useCase.execute(
          registerData.email,
          registerData.password,
          registerData.name,
        ),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'User already exists',
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        registerData.email,
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw HttpException when repository throws error', async () => {
      // Arrange
      const error = new Error('Database error');
      (mockUserRepository.findByEmail as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        useCase.execute(
          registerData.email,
          registerData.password,
          registerData.name,
        ),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error registering user',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should throw HttpException when password hashing fails', async () => {
      // Arrange
      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing error'));

      // Act & Assert
      await expect(
        useCase.execute(
          registerData.email,
          registerData.password,
          registerData.name,
        ),
      ).rejects.toThrow(HttpException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
});
