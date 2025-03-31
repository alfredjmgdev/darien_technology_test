import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateSpaceUseCase } from './updateSpace.useCase';
import { SpaceRepositoryPort } from '../../../domain/repositories/space.repository.port';
import { Space } from '../../../domain/entities/space.entity';

describe('UpdateSpaceUseCase', () => {
  let useCase: UpdateSpaceUseCase;
  let mockSpaceRepository: SpaceRepositoryPort;

  const mockSpace: Space = {
    id: 1,
    name: 'Conference Room A',
    location: 'Building 1, Floor 2',
    capacity: 20,
    description: 'Large conference room with projector',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedMockSpace: Space = {
    ...mockSpace,
    name: 'Updated Conference Room',
    capacity: 25,
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockSpaceRepository = {
      findById: jest.fn() as jest.MockedFunction<
        SpaceRepositoryPort['findById']
      >,
      findAll: jest.fn() as jest.MockedFunction<SpaceRepositoryPort['findAll']>,
      create: jest.fn() as jest.MockedFunction<SpaceRepositoryPort['create']>,
      update: jest.fn() as jest.MockedFunction<SpaceRepositoryPort['update']>,
      delete: jest.fn() as jest.MockedFunction<SpaceRepositoryPort['delete']>,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSpaceUseCase,
        {
          provide: 'SpaceRepositoryPort',
          useValue: mockSpaceRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateSpaceUseCase>(UpdateSpaceUseCase);
  });

  describe('execute', () => {
    const updateData = {
      name: 'Updated Conference Room',
      capacity: 25,
    };

    it('should successfully update a space', async () => {
      // Arrange
      jest.useFakeTimers();
      const fixedDate = new Date('2025-03-30T02:11:58.384Z');
      jest.setSystemTime(fixedDate);

      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(mockSpace);
      (mockSpaceRepository.update as jest.Mock).mockResolvedValue(
        updatedMockSpace,
      );

      // Act
      const result = await useCase.execute(1, updateData);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Space updated successfully',
        data: { id: updatedMockSpace.id },
      });
      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(1);
      expect(mockSpaceRepository.update).toHaveBeenCalledWith(1, {
        ...updateData,
        updatedAt: fixedDate,
      });

      jest.useRealTimers();
    });

    it('should throw HttpException when space is not found', async () => {
      // Arrange
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(999, updateData)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Space with ID 999 not found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(999);
      expect(mockSpaceRepository.update).not.toHaveBeenCalled();
    });

    it('should throw HttpException when repository throws error during findById', async () => {
      // Arrange
      const error = new Error('Database error');
      (mockSpaceRepository.findById as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(1, updateData)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error updating space',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should throw HttpException when repository throws error during update', async () => {
      // Arrange
      const error = new Error('Database error');
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(mockSpace);
      (mockSpaceRepository.update as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(1, updateData)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error updating space',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should pass through HttpException thrown by repository', async () => {
      // Arrange
      const httpError = new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid data',
        },
        HttpStatus.BAD_REQUEST,
      );
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(mockSpace);
      (mockSpaceRepository.update as jest.Mock).mockRejectedValue(httpError);

      // Act & Assert
      await expect(useCase.execute(1, updateData)).rejects.toThrow(httpError);
    });
  });
});
