import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GetSpaceByIdUseCase } from './getSpaceById.useCase';
import { SpaceRepositoryPort } from '../../../domain/repositories/space.repository.port';
import { Space } from '../../../domain/entities/space.entity';

describe('GetSpaceByIdUseCase', () => {
  let useCase: GetSpaceByIdUseCase;
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
        GetSpaceByIdUseCase,
        {
          provide: 'SpaceRepositoryPort',
          useValue: mockSpaceRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetSpaceByIdUseCase>(GetSpaceByIdUseCase);
  });

  describe('execute', () => {
    it('should successfully retrieve a space by ID', async () => {
      // Arrange
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(mockSpace);

      // Act
      const result = await useCase.execute(1);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Space retrieved successfully',
        data: mockSpace,
      });
      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException when space is not found', async () => {
      // Arrange
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(999)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Space with ID 999 not found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should throw HttpException when repository throws error', async () => {
      // Arrange
      const error = new Error('Database error');
      (mockSpaceRepository.findById as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error retrieving space',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
