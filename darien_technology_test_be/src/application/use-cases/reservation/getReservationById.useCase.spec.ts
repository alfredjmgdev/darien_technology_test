import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GetReservationByIdUseCase } from './getReservationById.useCase';
import { ReservationRepositoryPort } from '../../../domain/repositories/reservation.repository.port';
import { Reservation } from '../../../domain/entities/reservation.entity';

describe('GetReservationByIdUseCase', () => {
  let useCase: GetReservationByIdUseCase;
  let mockReservationRepository: ReservationRepositoryPort;

  const mockReservation: Reservation = {
    id: 1,
    spaceId: 1,
    userEmail: 'test@example.com',
    reservationDate: new Date('2023-01-01'),
    startTime: new Date('2023-01-01T10:00:00'),
    endTime: new Date('2023-01-01T12:00:00'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
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
        GetReservationByIdUseCase,
        {
          provide: 'ReservationRepositoryPort',
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetReservationByIdUseCase>(GetReservationByIdUseCase);
  });

  describe('execute', () => {
    it('should return a reservation when it exists', async () => {
      // Arrange
      (mockReservationRepository.findById as jest.Mock).mockResolvedValue(
        mockReservation,
      );

      // Act
      const result = await useCase.execute(1);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Reservation retrieved successfully',
        data: mockReservation,
      });
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException when reservation is not found', async () => {
      // Arrange
      (mockReservationRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(999)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Reservation with ID 999 not found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should throw HttpException when repository throws error', async () => {
      // Arrange
      const error = new Error('Database error');
      (mockReservationRepository.findById as jest.Mock).mockRejectedValue(
        error,
      );

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error retrieving reservation',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should pass through HttpException thrown by repository', async () => {
      // Arrange
      const httpError = new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid reservation ID format',
        },
        HttpStatus.BAD_REQUEST,
      );
      (mockReservationRepository.findById as jest.Mock).mockRejectedValue(
        httpError,
      );

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow(httpError);
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(1);
    });
  });
});
