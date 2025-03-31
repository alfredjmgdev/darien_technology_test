import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeleteReservationUseCase } from './deleteReservation.useCase';
import { ReservationRepositoryPort } from '../../../domain/repositories/reservation.repository.port';
import { Reservation } from '../../../domain/entities/reservation.entity';

describe('DeleteReservationUseCase', () => {
  let useCase: DeleteReservationUseCase;
  let mockReservationRepository: ReservationRepositoryPort;

  const mockReservation: Reservation = {
    id: 1,
    spaceId: 1,
    userEmail: 'test@example.com',
    reservationDate: new Date(),
    startTime: new Date(),
    endTime: new Date(),
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
        DeleteReservationUseCase,
        {
          provide: 'ReservationRepositoryPort',
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteReservationUseCase>(DeleteReservationUseCase);
  });

  describe('execute', () => {
    it('should delete a reservation successfully when user is authorized', async () => {
      // Arrange
      (mockReservationRepository.findById as jest.Mock).mockResolvedValue(
        mockReservation,
      );
      (mockReservationRepository.delete as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Act
      const result = await useCase.execute(1, 'test@example.com');

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Reservation deleted successfully',
      });
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(1);
      expect(mockReservationRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException when reservation is not found', async () => {
      // Arrange
      (mockReservationRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(999, 'test@example.com')).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Reservation with ID 999 not found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(999);
      expect(mockReservationRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw HttpException when user is not authorized to delete the reservation', async () => {
      // Arrange
      (mockReservationRepository.findById as jest.Mock).mockResolvedValue(
        mockReservation,
      );

      // Act & Assert
      await expect(
        useCase.execute(1, 'unauthorized@example.com'),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'You are not authorized to delete this reservation',
          },
          HttpStatus.FORBIDDEN,
        ),
      );
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(1);
      expect(mockReservationRepository.delete).not.toHaveBeenCalled();
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
      (mockReservationRepository.findById as jest.Mock).mockRejectedValue(
        error,
      );

      // Act & Assert
      await expect(useCase.execute(1, 'test@example.com')).rejects.toThrow(
        error,
      );
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException when delete operation fails', async () => {
      // Arrange
      (mockReservationRepository.findById as jest.Mock).mockResolvedValue(
        mockReservation,
      );
      const error = new Error('Delete operation failed');
      (mockReservationRepository.delete as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(1, 'test@example.com')).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error deleting reservation',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(1);
      expect(mockReservationRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
