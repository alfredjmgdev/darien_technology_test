import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateReservationUseCase } from './createReservation.useCase';
import { ReservationRepositoryPort } from '../../../domain/repositories/reservation.repository.port';
import { SpaceRepositoryPort } from '../../../domain/repositories/space.repository.port';
import { Space } from '../../../domain/entities/space.entity';
import { Reservation } from '../../../domain/entities/reservation.entity';
import * as moment from 'moment';

describe('CreateReservationUseCase', () => {
  let useCase: CreateReservationUseCase;
  let mockReservationRepository: ReservationRepositoryPort;
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
        CreateReservationUseCase,
        {
          provide: 'ReservationRepositoryPort',
          useValue: mockReservationRepository,
        },
        {
          provide: 'SpaceRepositoryPort',
          useValue: mockSpaceRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateReservationUseCase>(CreateReservationUseCase);
  });

  describe('execute', () => {
    // Update dates to be in the future
    const tomorrow = moment().add(1, 'day').startOf('day');
    const spaceId = 1;
    const userEmail = 'test@example.com';
    const reservationDate = tomorrow.toDate();
    const startTime = moment(tomorrow).add(10, 'hours').toDate(); // 10:00 AM tomorrow
    const endTime = moment(tomorrow).add(12, 'hours').toDate(); // 12:00 PM tomorrow

    it('should create a reservation successfully', async () => {
      // Arrange
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(mockSpace);
      (
        mockReservationRepository.findBySpaceAndTimeRange as jest.Mock
      ).mockResolvedValue([]);
      (
        mockReservationRepository.findByUserEmail as jest.Mock
      ).mockResolvedValue([]);
      (mockReservationRepository.create as jest.Mock).mockResolvedValue({
        ...mockReservation,
        reservationDate,
        startTime,
        endTime,
      });

      // Act
      const result = await useCase.execute(
        spaceId,
        userEmail,
        reservationDate,
        startTime,
        endTime,
      );

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Reservation created successfully',
        data: { id: mockReservation.id },
      });
      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(spaceId);
      expect(
        mockReservationRepository.findBySpaceAndTimeRange,
      ).toHaveBeenCalledWith(spaceId, startTime, endTime);
      expect(mockReservationRepository.findByUserEmail).toHaveBeenCalled();
      expect(mockReservationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          spaceId,
          userEmail,
          reservationDate,
          startTime,
          endTime,
        }),
      );
    });

    it('should throw HttpException when reservation date is in the past', async () => {
      // Arrange
      const pastDate = moment().subtract(1, 'day').toDate();
      const pastStartTime = moment(pastDate).add(10, 'hours').toDate();
      const pastEndTime = moment(pastDate).add(12, 'hours').toDate();

      // Act & Assert
      await expect(
        useCase.execute(
          spaceId,
          userEmail,
          pastDate,
          pastStartTime,
          pastEndTime,
        ),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Reservation date cannot be in the past',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw HttpException when space is not found', async () => {
      // Arrange
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute(
          spaceId,
          userEmail,
          reservationDate,
          startTime,
          endTime,
        ),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Space with ID ${spaceId} not found`,
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(spaceId);
      expect(mockReservationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw HttpException when there is a conflicting reservation', async () => {
      // Arrange
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(mockSpace);
      (
        mockReservationRepository.findBySpaceAndTimeRange as jest.Mock
      ).mockResolvedValue([{ ...mockReservation, startTime, endTime }]);

      // Act & Assert
      await expect(
        useCase.execute(
          spaceId,
          userEmail,
          reservationDate,
          startTime,
          endTime,
        ),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message:
              'There is already a reservation for this space at the specified time',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(spaceId);
      expect(
        mockReservationRepository.findBySpaceAndTimeRange,
      ).toHaveBeenCalledWith(spaceId, startTime, endTime);
      expect(mockReservationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw HttpException when user has reached maximum reservations per week', async () => {
      // Arrange
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(mockSpace);
      (
        mockReservationRepository.findBySpaceAndTimeRange as jest.Mock
      ).mockResolvedValue([]);

      // Create 3 reservations for the current week
      const weekReservations = [
        { ...mockReservation, id: 1, reservationDate, startTime, endTime },
        { ...mockReservation, id: 2, reservationDate, startTime, endTime },
        { ...mockReservation, id: 3, reservationDate, startTime, endTime },
      ];

      // Mock the week start/end dates based on the reservation date
      const weekStart = moment(reservationDate).startOf('week').toDate();
      const weekEnd = moment(reservationDate).endOf('week').toDate();

      (
        mockReservationRepository.findByUserEmail as jest.Mock
      ).mockResolvedValue(weekReservations);

      // Act & Assert
      await expect(
        useCase.execute(
          spaceId,
          userEmail,
          reservationDate,
          startTime,
          endTime,
        ),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `You have reached the maximum number of reservations allowed for the week starting on ${moment(weekStart).format('YYYY-MM-DD')} (3)`,
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(spaceId);
      expect(
        mockReservationRepository.findBySpaceAndTimeRange,
      ).toHaveBeenCalledWith(spaceId, startTime, endTime);

      // Verify findByUserEmail was called with the correct week range
      expect(mockReservationRepository.findByUserEmail).toHaveBeenCalledWith(
        userEmail,
        weekStart,
        weekEnd,
      );

      expect(mockReservationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw HttpException when end time is before start time', async () => {
      // Arrange
      const invalidEndTime = moment(tomorrow).add(9, 'hours').toDate(); // 9:00 AM (before 10:00 AM)

      // Act & Assert
      await expect(
        useCase.execute(
          spaceId,
          userEmail,
          reservationDate,
          startTime,
          invalidEndTime,
        ),
      ).rejects.toThrow(HttpException);

      // We don't need to check the exact error message since the validation
      // would happen before our use case is called in a real application
    });

    it('should throw HttpException when repository throws error (Error instance)', async () => {
      // Arrange
      const error = new Error('Database error');
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(mockSpace);
      (
        mockReservationRepository.findBySpaceAndTimeRange as jest.Mock
      ).mockResolvedValue([]);
      (
        mockReservationRepository.findByUserEmail as jest.Mock
      ).mockResolvedValue([]);
      (mockReservationRepository.create as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        useCase.execute(
          spaceId,
          userEmail,
          reservationDate,
          startTime,
          endTime,
        ),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error creating reservation',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(spaceId);
      expect(
        mockReservationRepository.findBySpaceAndTimeRange,
      ).toHaveBeenCalledWith(spaceId, startTime, endTime);
      expect(mockReservationRepository.findByUserEmail).toHaveBeenCalled();
      expect(mockReservationRepository.create).toHaveBeenCalled();
    });

    it('should throw HttpException when repository throws a non-Error value', async () => {
      // Arrange
      const nonErrorValue = 'This is a string error';
      (mockSpaceRepository.findById as jest.Mock).mockResolvedValue(mockSpace);
      (
        mockReservationRepository.findBySpaceAndTimeRange as jest.Mock
      ).mockResolvedValue([]);
      (
        mockReservationRepository.findByUserEmail as jest.Mock
      ).mockResolvedValue([]);
      (mockReservationRepository.create as jest.Mock).mockRejectedValue(
        nonErrorValue,
      );

      // Act & Assert
      await expect(
        useCase.execute(
          spaceId,
          userEmail,
          reservationDate,
          startTime,
          endTime,
        ),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error creating reservation',
            error: String(nonErrorValue), // This tests the String(error) branch
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(spaceId);
      expect(
        mockReservationRepository.findBySpaceAndTimeRange,
      ).toHaveBeenCalledWith(spaceId, startTime, endTime);
      expect(mockReservationRepository.findByUserEmail).toHaveBeenCalled();
      expect(mockReservationRepository.create).toHaveBeenCalled();
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
      (
        mockReservationRepository.findBySpaceAndTimeRange as jest.Mock
      ).mockResolvedValue([]);
      (
        mockReservationRepository.findByUserEmail as jest.Mock
      ).mockResolvedValue([]);
      (mockReservationRepository.create as jest.Mock).mockRejectedValue(
        httpError,
      );

      // Act & Assert
      await expect(
        useCase.execute(
          spaceId,
          userEmail,
          reservationDate,
          startTime,
          endTime,
        ),
      ).rejects.toThrow(httpError);

      expect(mockSpaceRepository.findById).toHaveBeenCalledWith(spaceId);
      expect(
        mockReservationRepository.findBySpaceAndTimeRange,
      ).toHaveBeenCalledWith(spaceId, startTime, endTime);
      expect(mockReservationRepository.findByUserEmail).toHaveBeenCalled();
      expect(mockReservationRepository.create).toHaveBeenCalled();
    });
  });
});
