import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GetSpacesUseCase } from './getSpaces.useCase';
import { SpaceRepositoryPort } from '../../../domain/repositories/space.repository.port';
import { Space } from '../../../domain/entities/space.entity';

describe('GetSpacesUseCase', () => {
  let useCase: GetSpacesUseCase;
  let mockSpaceRepository: SpaceRepositoryPort;

  const mockSpaces: Space[] = [
    {
      id: 1,
      name: 'Conference Room A',
      location: 'Building 1, Floor 2',
      capacity: 20,
      description: 'Large conference room with projector',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'Meeting Room B',
      location: 'Building 2, Floor 1',
      capacity: 10,
      description: 'Small meeting room',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

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
        GetSpacesUseCase,
        {
          provide: 'SpaceRepositoryPort',
          useValue: mockSpaceRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetSpacesUseCase>(GetSpacesUseCase);
  });

  describe('execute', () => {
    it('should successfully retrieve spaces with pagination', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const total = mockSpaces.length;
      const totalPages = Math.ceil(total / limit);

      (mockSpaceRepository.findAll as jest.Mock).mockResolvedValue({
        spaces: mockSpaces,
        total,
      });

      // Act
      const result = await useCase.execute(page, limit);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Spaces retrieved successfully',
        data: {
          spaces: mockSpaces,
          pagination: {
            total: Number(total),
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
          },
        },
      });
      expect(mockSpaceRepository.findAll).toHaveBeenCalledWith(page, limit);
    });

    it('should use default pagination values when not provided', async () => {
      // Arrange
      const defaultPage = 1;
      const defaultLimit = 10;
      const total = mockSpaces.length;
      const totalPages = Math.ceil(total / defaultLimit);

      (mockSpaceRepository.findAll as jest.Mock).mockResolvedValue({
        spaces: mockSpaces,
        total,
      });

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Spaces retrieved successfully',
        data: {
          spaces: mockSpaces,
          pagination: {
            total: Number(total),
            page: Number(defaultPage),
            totalPages: Number(totalPages),
            limit: Number(defaultLimit),
          },
        },
      });
      expect(mockSpaceRepository.findAll).toHaveBeenCalledWith(
        defaultPage,
        defaultLimit,
      );
    });

    it('should throw HttpException when repository throws error', async () => {
      // Arrange
      const error = new Error('Database error');
      (mockSpaceRepository.findAll as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(1, 10)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error retrieving spaces',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
