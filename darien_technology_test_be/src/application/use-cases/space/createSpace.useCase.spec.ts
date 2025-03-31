import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateSpaceUseCase } from './createSpace.useCase';
import { SpaceRepositoryPort } from '../../../domain/repositories/space.repository.port';

describe('CreateSpaceUseCase', () => {
  let useCase: CreateSpaceUseCase;
  let mockSpaceRepository: SpaceRepositoryPort;

  const mockSpace = {
    id: 1,
    name: 'Conference Room A',
    location: 'Building 1, Floor 2',
    capacity: 20,
    description: 'Large conference room with projector',
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    mockSpaceRepository = {
      findAll: jest.fn() as jest.MockedFunction<SpaceRepositoryPort['findAll']>,
      findById: jest.fn() as jest.MockedFunction<
        SpaceRepositoryPort['findById']
      >,
      create: jest.fn() as jest.MockedFunction<SpaceRepositoryPort['create']>,
      update: jest.fn() as jest.MockedFunction<SpaceRepositoryPort['update']>,
      delete: jest.fn() as jest.MockedFunction<SpaceRepositoryPort['delete']>,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSpaceUseCase,
        {
          provide: 'SpaceRepositoryPort',
          useValue: mockSpaceRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateSpaceUseCase>(CreateSpaceUseCase);
  });

  describe('execute', () => {
    const spaceData = {
      name: 'Conference Room A',
      location: 'Building 1, Floor 2',
      capacity: 20,
      description: 'Large conference room with projector',
    };

    it('should successfully create a new space', async () => {
      // Arrange
      jest.useFakeTimers();
      const fixedDate = new Date('2023-01-01T00:00:00.000Z');
      jest.setSystemTime(fixedDate);

      (mockSpaceRepository.create as jest.Mock).mockResolvedValue(mockSpace);

      // Act
      const result = await useCase.execute(
        spaceData.name,
        spaceData.location,
        spaceData.capacity,
        spaceData.description,
      );

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Space created successfully',
        data: { id: mockSpace.id },
      });

      expect(mockSpaceRepository.create).toHaveBeenCalledWith({
        name: spaceData.name,
        location: spaceData.location,
        capacity: spaceData.capacity,
        description: spaceData.description,
        createdAt: fixedDate,
        updatedAt: fixedDate,
      });

      jest.useRealTimers();
    });

    it('should throw HttpException when repository throws error (Error instance)', async () => {
      // Arrange
      const error = new Error('Database error');
      (mockSpaceRepository.create as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        useCase.execute(
          spaceData.name,
          spaceData.location,
          spaceData.capacity,
          spaceData.description,
        ),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error creating space',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      // Verify the mock was called with the correct parameters
      expect(mockSpaceRepository.create).toHaveBeenCalled();
    });

    // New test to cover the non-Error instance branch
    it('should throw HttpException when repository throws a non-Error value', async () => {
      // Arrange
      const nonErrorValue = 'This is a string error';
      (mockSpaceRepository.create as jest.Mock).mockRejectedValue(
        nonErrorValue,
      );

      // Act & Assert
      await expect(
        useCase.execute(
          spaceData.name,
          spaceData.location,
          spaceData.capacity,
          spaceData.description,
        ),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error creating space',
            error: String(nonErrorValue), // This tests the String(error) branch
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      // Verify the mock was called with the correct parameters
      expect(mockSpaceRepository.create).toHaveBeenCalled();
    });

    it('should create a space without description when not provided', async () => {
      // Arrange
      jest.useFakeTimers();
      const fixedDate = new Date('2023-01-01T00:00:00.000Z');
      jest.setSystemTime(fixedDate);

      const spaceWithoutDescription = {
        ...mockSpace,
        description: undefined as undefined,
      };
      (mockSpaceRepository.create as jest.Mock).mockResolvedValue(
        spaceWithoutDescription,
      );

      // Act
      const result = await useCase.execute(
        spaceData.name,
        spaceData.location,
        spaceData.capacity,
      );

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Space created successfully',
        data: { id: mockSpace.id },
      });

      expect(mockSpaceRepository.create).toHaveBeenCalledWith({
        name: spaceData.name,
        location: spaceData.location,
        capacity: spaceData.capacity,
        description: undefined,
        createdAt: fixedDate,
        updatedAt: fixedDate,
      });

      jest.useRealTimers();
    });

    // Additional test to cover numeric error case
    it('should throw HttpException when repository throws a numeric error', async () => {
      // Arrange
      const numericError = 404;
      (mockSpaceRepository.create as jest.Mock).mockRejectedValue(numericError);

      // Act & Assert
      await expect(
        useCase.execute(
          spaceData.name,
          spaceData.location,
          spaceData.capacity,
          spaceData.description,
        ),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error creating space',
            error: String(numericError), // Tests the String(error) branch with a number
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      // Verify the mock was called with the correct parameters
      expect(mockSpaceRepository.create).toHaveBeenCalled();
    });
  });
});
