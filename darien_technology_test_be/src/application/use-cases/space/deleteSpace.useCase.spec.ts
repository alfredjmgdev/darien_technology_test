import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeleteSpaceUseCase } from './deleteSpace.useCase';
import { SpaceRepositoryPort } from '../../../domain/repositories/space.repository.port';
import { ReservationRepositoryPort } from '../../../domain/repositories/reservation.repository.port';
import { Space } from '../../../domain/entities/space.entity';
import { Reservation } from '../../../domain/entities/reservation.entity';

describe('DeleteSpaceUseCase', () => {
  let useCase: DeleteSpaceUseCase;
  let mockSpaceRepository: SpaceRepositoryPort;
  let mockReservationRepository: ReservationRepositoryPort;

  const mockSpace: Space = {
    id: 1,
    name: 'Test Space',
    location: 'Test Location',
    capacity: 10,
    description: 'Test Description',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReservations: Reservation[] = [
    {
      id: 1,
      spaceId: 1,
      userEmail: 'test@example.com',
      reservationDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
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

    mockReservationRepository = {
      findById: jest.fn() as jest.MockedFunction<
        ReservationRepositoryPort['findById']
      >,
      findAll: jest.fn() as jest.MockedFunction<
        ReservationRepositoryPort['findAll']
      >,
      findAllWithoutPagination: jest.fn() as jest.MockedFunction<
        ReservationRepositoryPort['findAllWithoutPagination']
      >,
      findByUserEmail: jest.fn() as jest.MockedFunction<
        ReservationRepositoryPort['findByUserEmail']
      >,
      findBySpaceAndTimeRange: jest.fn() as jest.MockedFunction<
        ReservationRepositoryPort['findBySpaceAndTimeRange']
      >,
      create: jest.fn() as jest.MockedFunction<
        ReservationRepositoryPort['create']
      >,
      update: jest.fn() as jest.MockedFunction<
        ReservationRepositoryPort['update']
      >,
      delete: jest.fn() as jest.MockedFunction<
        ReservationRepositoryPort['delete']
      >,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSpaceUseCase,
        {
          provide: 'SpaceRepositoryPort',
          useValue: mockSpaceRepository,
        },
        {
          provide: 'ReservationRepositoryPort',
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteSpaceUseCase>(DeleteSpaceUseCase);
  });

  describe('execute', () => {
    it('should successfully delete a space with no reservations', async () => {
      // Arrange
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(mockSpace);
      (
        mockReservationRepository.findAllWithoutPagination as jest.Mock
      ).mockResolvedValue([]);
      (mockSpaceRepository.delete as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(1);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Space deleted successfully',
      });
      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(1);
      expect(
        mockReservationRepository.findAllWithoutPagination,
      ).toHaveBeenCalledWith({ spaceId: 1 }, [], []);
      expect(mockSpaceRepository.delete).toHaveBeenCalledWith(1);
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
      expect(
        mockReservationRepository.findAllWithoutPagination,
      ).not.toHaveBeenCalled();
      expect(mockSpaceRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw HttpException when space has existing reservations', async () => {
      // Arrange
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(mockSpace);
      (
        mockReservationRepository.findAllWithoutPagination as jest.Mock
      ).mockResolvedValue(mockReservations);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Cannot delete space with existing reservations',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(1);
      expect(
        mockReservationRepository.findAllWithoutPagination,
      ).toHaveBeenCalledWith({ spaceId: 1 }, [], []);
      expect(mockSpaceRepository.delete).not.toHaveBeenCalled();
    });

    it('should rethrow HttpException when one is thrown', async () => {
      // Arrange
      const error = new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      (mockSpaceRepository.findById as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow(error);
      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException when repository throws error', async () => {
      // Arrange
      const error = new Error('Database connection error');
      (mockSpaceRepository.findById as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error deleting space',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException when delete operation fails', async () => {
      // Arrange
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(mockSpace);
      (
        mockReservationRepository.findAllWithoutPagination as jest.Mock
      ).mockResolvedValue([]);
      const error = new Error('Delete operation failed');
      (mockSpaceRepository.delete as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error deleting space',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(1);
      expect(
        mockReservationRepository.findAllWithoutPagination,
      ).toHaveBeenCalledWith({ spaceId: 1 }, [], []);
      expect(mockSpaceRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
