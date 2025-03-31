import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { UserEntity } from '../database/entities/user.entity';
import { User } from '../../domain/entities/user.entity';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<UserEntity>>;

  const mockUserEntity: UserEntity = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    mockTypeOrmRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserEntity>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('findById', () => {
    it('should return a user when found by ID', async () => {
      // Arrange
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUserEntity);

      // Act
      const result = await userRepository.findById(1);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when user is not found by ID', async () => {
      // Arrange
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await userRepository.findById(999);

      // Assert
      expect(result).toBeNull();
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it('should throw an error when database operation fails', async () => {
      // Arrange
      const error = new Error('Database error');
      mockTypeOrmRepository.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(userRepository.findById(1)).rejects.toThrow(
        'Error finding user by ID: Database error',
      );
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      // Arrange
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUserEntity);
      const email = 'test@example.com';

      // Act
      const result = await userRepository.findByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return null when user is not found by email', async () => {
      // Arrange
      mockTypeOrmRepository.findOne.mockResolvedValue(null);
      const email = 'nonexistent@example.com';

      // Act
      const result = await userRepository.findByEmail(email);

      // Assert
      expect(result).toBeNull();
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should throw an error when database operation fails', async () => {
      // Arrange
      const error = new Error('Database error');
      mockTypeOrmRepository.findOne.mockRejectedValue(error);
      const email = 'test@example.com';

      // Act & Assert
      await expect(userRepository.findByEmail(email)).rejects.toThrow(
        'Error finding user by email: Database error',
      );
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      // Arrange
      const newUserData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        createdAt: new Date(),
      };

      const savedEntity = {
        id: 2,
        ...newUserData,
        updatedAt: new Date(),
      };

      mockTypeOrmRepository.create.mockReturnValue(newUserData as UserEntity);
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity as UserEntity);

      // Act
      const result = await userRepository.create(newUserData);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: 2,
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        }),
      );
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(newUserData);
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });

    it('should throw an error when database operation fails', async () => {
      // Arrange
      const error = new Error('Database error');
      mockTypeOrmRepository.create.mockReturnValue({} as UserEntity);
      mockTypeOrmRepository.save.mockRejectedValue(error);

      const newUserData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        createdAt: new Date(),
      };

      // Act & Assert
      await expect(userRepository.create(newUserData)).rejects.toThrow(
        'Error creating user: Database error',
      );
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(newUserData);
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      // Arrange
      const userId = 1;
      const updateData = { name: 'Updated Name' };
      const updatedEntity = {
        ...mockUserEntity,
        ...updateData,
      };
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUserEntity);
      mockTypeOrmRepository.save.mockResolvedValue(updatedEntity);

      // Act
      const result = await userRepository.update(userId, updateData);

      // Assert
      expect(result).toEqual({
        ...mockUser,
        ...updateData,
      });
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });

    it('should throw an error when user is not found', async () => {
      // Arrange
      const userId = 999;
      const updateData = { name: 'Updated Name' };
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(userRepository.update(userId, updateData)).rejects.toThrow(
        `Error updating user: User with id ${userId} does not exist`,
      );
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockTypeOrmRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error when database operation fails', async () => {
      // Arrange
      const userId = 1;
      const updateData = { name: 'Updated Name' };
      const error = new Error('Database error');

      mockTypeOrmRepository.findOne.mockResolvedValue(mockUserEntity);
      mockTypeOrmRepository.save.mockRejectedValue(error);

      // Act & Assert
      await expect(userRepository.update(userId, updateData)).rejects.toThrow(
        'Error updating user: Database error',
      );
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      // Arrange
      const userId = 1;
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      // Act
      await userRepository.delete(userId);

      // Assert
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw an error when database operation fails', async () => {
      // Arrange
      const userId = 1;
      const error = new Error('Database error');
      mockTypeOrmRepository.delete.mockRejectedValue(error);

      // Act & Assert
      await expect(userRepository.delete(userId)).rejects.toThrow(
        'Error deleting user: Database error',
      );
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe('mapToDomain', () => {
    it('should correctly map entity to domain model', async () => {
      // Create completely new test data for this test
      const testEntity = {
        id: 5,
        email: 'maptest@example.com',
        password: 'testPassword',
        name: 'Map Test User',
        createdAt: new Date('2023-05-05T00:00:00.000Z'),
        updatedAt: new Date('2023-05-05T00:00:00.000Z'),
      };

      // Expected domain model after mapping
      const expectedDomainModel = {
        id: 5,
        email: 'maptest@example.com',
        password: 'testPassword',
        name: 'Map Test User',
        createdAt: new Date('2023-05-05T00:00:00.000Z'),
        updatedAt: new Date('2023-05-05T00:00:00.000Z'),
      };

      // Reset mock and set up new response
      mockTypeOrmRepository.findOne.mockReset();
      mockTypeOrmRepository.findOne.mockResolvedValue(testEntity);

      // Act
      const result = await userRepository.findById(5);

      // Assert
      expect(result).toEqual(expectedDomainModel);
    });
  });
});
