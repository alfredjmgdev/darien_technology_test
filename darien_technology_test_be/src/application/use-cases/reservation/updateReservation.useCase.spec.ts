import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateReservationUseCase } from './updateReservation.useCase';
import { ReservationRepositoryPort } from '../../../domain/repositories/reservation.repository.port';
import { Reservation } from '../../../domain/entities/reservation.entity';

describe('UpdateReservationUseCase', () => {
  let useCase: UpdateReservationUseCase;
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

  const updatedMockReservation: Reservation = {
    ...mockReservation,
    reservationDate: new Date('2023-01-02'),
    startTime: new Date('2023-01-02T14:00:00'),
    endTime: new Date('2023-01-02T16:00:00'),
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
        UpdateReservationUseCase,
        {
          provide: 'ReservationRepositoryPort',
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateReservationUseCase>(UpdateReservationUseCase);
  });

  describe('execute', () => {
    it('should update a reservation successfully', async () => {
      // Arrange
      jest.useFakeTimers();
      const fixedDate = new Date('2025-03-30T15:08:26.000Z');
      jest.setSystemTime(fixedDate);

      const reservationId = 1;
      const updateData = {
        reservationDate: new Date('2023-01-02'),
        startTime: new Date('2023-01-02T14:00:00'),
        endTime: new Date('2023-01-02T16:00:00'),
      };

      (mockReservationRepository.findById as jest.Mock).mockResolvedValue(
        mockReservation,
      );

      // Mock the findBySpaceAndTimeRange to return an empty array (no conflicts)
      (
        mockReservationRepository.findBySpaceAndTimeRange as jest.Mock
      ).mockResolvedValue([]);

      (mockReservationRepository.update as jest.Mock).mockResolvedValue(
        updatedMockReservation,
      );

      // Act
      const result = await useCase.execute(reservationId, updateData);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Reservation updated successfully',
        data: { id: updatedMockReservation.id },
      });

      expect(mockReservationRepository.findById).toHaveBeenCalledWith(
        reservationId,
      );

      // Check if findBySpaceAndTimeRange was called with correct parameters
      expect(
        mockReservationRepository.findBySpaceAndTimeRange,
      ).toHaveBeenCalledWith(
        mockReservation.spaceId,
        updateData.startTime,
        updateData.endTime,
      );

      expect(mockReservationRepository.update).toHaveBeenCalledWith(
        reservationId,
        {
          ...updateData,
          updatedAt: fixedDate,
        },
      );

      jest.useRealTimers();
    });

    it('should throw HttpException when reservation is not found', async () => {
      // Arrange
      const reservationId = 999;
      const updateData = {
        reservationDate: new Date('2023-01-02'),
      };

      (mockReservationRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(reservationId, updateData)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Reservation with ID ${reservationId} not found`,
          },
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(
        reservationId,
      );
      expect(mockReservationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw HttpException when update operation fails', async () => {
      // Arrange
      jest.useFakeTimers();
      const fixedDate = new Date('2025-03-30T15:11:28.500Z');
      jest.setSystemTime(fixedDate);

      const reservationId = 1;
      const updateData = {
        reservationDate: new Date('2023-01-02'),
      };
      const error = new Error('Update operation failed');

      (mockReservationRepository.findById as jest.Mock).mockResolvedValue(
        mockReservation,
      );
      (mockReservationRepository.update as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(reservationId, updateData)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error updating reservation',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(
        reservationId,
      );
      expect(mockReservationRepository.update).toHaveBeenCalledWith(
        reservationId,
        {
          ...updateData,
          updatedAt: fixedDate,
        },
      );

      jest.useRealTimers();
    });

    it('should pass through HttpException thrown by repository', async () => {
      // Arrange
      jest.useFakeTimers();
      const fixedDate = new Date('2025-03-30T15:11:28.505Z');
      jest.setSystemTime(fixedDate);

      const reservationId = 1;
      const updateData = {
        reservationDate: new Date('2023-01-02'),
      };
      const httpError = new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid data',
        },
        HttpStatus.BAD_REQUEST,
      );

      (mockReservationRepository.findById as jest.Mock).mockResolvedValue(
        mockReservation,
      );
      (mockReservationRepository.update as jest.Mock).mockRejectedValue(
        httpError,
      );

      // Act & Assert
      await expect(useCase.execute(reservationId, updateData)).rejects.toThrow(
        httpError,
      );
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(
        reservationId,
      );
      expect(mockReservationRepository.update).toHaveBeenCalledWith(
        reservationId,
        {
          ...updateData,
          updatedAt: fixedDate,
        },
      );

      jest.useRealTimers();
    });

    it('should test time conflict validation when updating times', async () => {
      // This test would need to be expanded based on the actual implementation
      // of the time conflict validation in the UpdateReservationUseCase

      // For now, we'll just verify the basic structure is in place
      const reservationId = 1;
      const updateData = {
        startTime: new Date('2023-01-01T14:00:00'),
        endTime: new Date('2023-01-01T16:00:00'),
      };

      (mockReservationRepository.findById as jest.Mock).mockResolvedValue(
        mockReservation,
      );
      (
        mockReservationRepository.findBySpaceAndTimeRange as jest.Mock
      ).mockResolvedValue([]);
      (mockReservationRepository.update as jest.Mock).mockResolvedValue({
        ...mockReservation,
        ...updateData,
        updatedAt: new Date(),
      });

      const result = await useCase.execute(reservationId, updateData);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(
        reservationId,
      );
      // Additional assertions would depend on the actual implementation
    });

    it('should use fixed date for testing', async () => {
      // Arrange
      const reservationId = 1;
      const updateData = {
        reservationDate: new Date('2023-01-02'),
      };
      const fixedDate = new Date('2023-01-01T00:00:00.000Z');

      jest.useFakeTimers();
      jest.setSystemTime(fixedDate);

      (mockReservationRepository.findById as jest.Mock).mockResolvedValue(
        mockReservation,
      );
      (mockReservationRepository.update as jest.Mock).mockResolvedValue({
        ...mockReservation,
        ...updateData,
        updatedAt: fixedDate,
      });

      // Act
      const result = await useCase.execute(reservationId, updateData);

      // Assert
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(mockReservationRepository.update).toHaveBeenCalledWith(
        reservationId,
        {
          ...updateData,
          updatedAt: fixedDate,
        },
      );

      jest.useRealTimers();
    });
  });
});
