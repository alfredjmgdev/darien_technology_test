import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GetReservationsUseCase } from './getReservations.useCase';
import { ReservationRepositoryPort } from '../../../domain/repositories/reservation.repository.port';
import { Reservation } from '../../../domain/entities/reservation.entity';

describe('GetReservationsUseCase', () => {
  let useCase: GetReservationsUseCase;
  let mockReservationRepository: ReservationRepositoryPort;

  const mockReservations: Reservation[] = [
    {
      id: 1,
      spaceId: 1,
      userEmail: 'test@example.com',
      reservationDate: new Date('2023-01-01'),
      startTime: new Date('2023-01-01T10:00:00'),
      endTime: new Date('2023-01-01T12:00:00'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      spaceId: 2,
      userEmail: 'user@example.com',
      reservationDate: new Date('2023-01-02'),
      startTime: new Date('2023-01-02T14:00:00'),
      endTime: new Date('2023-01-02T16:00:00'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

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
        GetReservationsUseCase,
        {
          provide: 'ReservationRepositoryPort',
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetReservationsUseCase>(GetReservationsUseCase);
  });

  describe('execute', () => {
    it('should return reservations with pagination', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const total = mockReservations.length;
      const totalPages = Math.ceil(total / limit);

      (mockReservationRepository.findAll as jest.Mock).mockResolvedValue({
        reservations: mockReservations,
        total,
      });

      // Act
      const result = await useCase.execute(page, limit);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Reservations retrieved successfully',
        data: {
          reservations: mockReservations,
          pagination: {
            total: Number(total),
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
          },
        },
      });
      expect(mockReservationRepository.findAll).toHaveBeenCalledWith(
        page,
        limit,
      );
    });

    it('should use default pagination values when not provided', async () => {
      // Arrange
      const defaultPage = 1;
      const defaultLimit = 10;
      const total = mockReservations.length;
      const totalPages = Math.ceil(total / defaultLimit);

      (mockReservationRepository.findAll as jest.Mock).mockResolvedValue({
        reservations: mockReservations,
        total,
      });

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Reservations retrieved successfully',
        data: {
          reservations: mockReservations,
          pagination: {
            total: Number(total),
            page: Number(defaultPage),
            totalPages: Number(totalPages),
            limit: Number(defaultLimit),
          },
        },
      });
      expect(mockReservationRepository.findAll).toHaveBeenCalledWith(
        defaultPage,
        defaultLimit,
      );
    });

    it('should throw HttpException when repository throws error', async () => {
      // Arrange
      const error = new Error('Database error');
      (mockReservationRepository.findAll as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(1, 10)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error retrieving reservations',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
