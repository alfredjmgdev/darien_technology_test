import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ReservationRepository } from './reservation.repository';
import { ReservationEntity } from '../database/entities/reservation.entity';
import { Reservation } from '../../domain/entities/reservation.entity';

describe('ReservationRepository', () => {
  let reservationRepository: ReservationRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<ReservationEntity>>;

  const mockReservationEntity: ReservationEntity = {
    id: 1,
    spaceId: 1,
    space: null,
    userEmail: 'test@example.com',
    reservationDate: new Date('2023-01-01'),
    startTime: new Date('2023-01-01T10:00:00.000Z'),
    endTime: new Date('2023-01-01T12:00:00.000Z'),
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  const mockReservation: Reservation = {
    id: 1,
    spaceId: 1,
    userEmail: 'test@example.com',
    reservationDate: new Date('2023-01-01'),
    startTime: new Date('2023-01-01T10:00:00.000Z'),
    endTime: new Date('2023-01-01T12:00:00.000Z'),
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    mockTypeOrmRepository = {
      findAndCount: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<Repository<ReservationEntity>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationRepository,
        {
          provide: getRepositoryToken(ReservationEntity),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    reservationRepository = module.get<ReservationRepository>(
      ReservationRepository,
    );
  });

  describe('findAll', () => {
    it('should return paginated reservations and total count', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const mockEntities = [mockReservationEntity];
      const mockTotal = 1;
      mockTypeOrmRepository.findAndCount.mockResolvedValue([
        mockEntities,
        mockTotal,
      ]);

      // Act
      const result = await reservationRepository.findAll(page, limit);

      // Assert
      expect(result).toEqual({
        reservations: [mockReservation],
        total: mockTotal,
      });
      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: limit,
        relations: ['space'],
      });
    });

    it('should handle errors during findAll', async () => {
      // Arrange
      mockTypeOrmRepository.findAndCount.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(reservationRepository.findAll(1, 10)).rejects.toThrow(
        'Error finding all reservations: Database error',
      );
    });

    it('should use default pagination values when not provided', async () => {
      // Arrange
      const mockEntities = [mockReservationEntity];
      const mockTotal = 1;
      mockTypeOrmRepository.findAndCount.mockResolvedValue([
        mockEntities,
        mockTotal,
      ]);

      // Act
      const result = await reservationRepository.findAll();

      // Assert
      expect(result).toEqual({
        reservations: [mockReservation],
        total: mockTotal,
      });
      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10, // Default limit
        relations: ['space'],
      });
    });
  });

  describe('findAllWithoutPagination', () => {
    it('should return reservations matching conditions', async () => {
      // Arrange
      const conditions: FindOptionsWhere<Reservation> = { spaceId: 1 };
      const select = ['id', 'spaceId'];
      const relations = ['space'];
      mockTypeOrmRepository.find.mockResolvedValue([mockReservationEntity]);

      // Act
      const result = await reservationRepository.findAllWithoutPagination(
        conditions,
        select,
        relations,
      );

      // Assert
      expect(result).toEqual([{ ...mockReservation, space: null }]);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: conditions,
        select: { id: true, spaceId: true },
        relations: relations.length > 0 ? relations : undefined,
      });
    });

    it('should handle empty select array', async () => {
      // Arrange
      const conditions: FindOptionsWhere<Reservation> = { spaceId: 1 };
      mockTypeOrmRepository.find.mockResolvedValue([mockReservationEntity]);

      // Act
      const result = await reservationRepository.findAllWithoutPagination(
        conditions,
        [],
        [],
      );

      // Assert
      expect(result).toEqual([{ ...mockReservation, space: null }]);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: conditions,
        select: {},
        relations: [],
      });
    });

    it('should handle empty relations array', async () => {
      // Arrange
      const conditions: FindOptionsWhere<Reservation> = { spaceId: 1 };
      const select = ['id', 'spaceId'];
      mockTypeOrmRepository.find.mockResolvedValue([mockReservationEntity]);

      // Act
      const result = await reservationRepository.findAllWithoutPagination(
        conditions,
        select,
        [],
      );

      // Assert
      expect(result).toEqual([{ ...mockReservation, space: null }]);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: conditions,
        select: { id: true, spaceId: true },
        relations: [],
      });
    });

    it('should handle errors during findAllWithoutPagination', async () => {
      // Arrange
      mockTypeOrmRepository.find.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        reservationRepository.findAllWithoutPagination({ spaceId: 1 }, [], []),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return a reservation by id', async () => {
      // Arrange
      mockTypeOrmRepository.findOne.mockResolvedValue(mockReservationEntity);

      // Act
      const result = await reservationRepository.findById(1);

      // Assert
      expect(result).toEqual(mockReservation);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['space'],
      });
    });

    it('should return null if reservation not found', async () => {
      // Arrange
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await reservationRepository.findById(999);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle errors during findById', async () => {
      // Arrange
      mockTypeOrmRepository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(reservationRepository.findById(1)).rejects.toThrow(
        'Error finding reservation by ID: Database error',
      );
    });
  });

  describe('findByUserEmail', () => {
    it('should return reservations by user email and date range', async () => {
      // Arrange
      const email = 'test@example.com';
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      mockTypeOrmRepository.find.mockResolvedValue([mockReservationEntity]);

      // Act
      const result = await reservationRepository.findByUserEmail(
        email,
        startDate,
        endDate,
      );

      // Assert
      expect(result).toEqual([mockReservation]);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: {
          userEmail: email,
          reservationDate: Between(startDate, endDate),
        },
        relations: ['space'],
      });
    });

    it('should handle errors during findByUserEmail', async () => {
      // Arrange
      mockTypeOrmRepository.find.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        reservationRepository.findByUserEmail(
          'test@example.com',
          new Date(),
          new Date(),
        ),
      ).rejects.toThrow(
        'Error finding reservations by user email: Database error',
      );
    });
  });

  describe('findBySpaceAndTimeRange', () => {
    it('should return reservations by space and time range', async () => {
      // Arrange
      const spaceId = 1;
      const startTime = new Date('2023-01-01T09:00:00.000Z');
      const endTime = new Date('2023-01-01T13:00:00.000Z');

      // Mock createQueryBuilder and its chain methods
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockReservationEntity]),
      };

      mockTypeOrmRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      // Act
      const result = await reservationRepository.findBySpaceAndTimeRange(
        spaceId,
        startTime,
        endTime,
      );

      // Assert
      expect(result).toEqual([mockReservation]);
    });

    it('should handle errors during findBySpaceAndTimeRange', async () => {
      // Arrange
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      mockTypeOrmRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      // Act & Assert
      await expect(
        reservationRepository.findBySpaceAndTimeRange(
          1,
          new Date(),
          new Date(),
        ),
      ).rejects.toThrow(
        'Error finding reservations by space and time range: Database error',
      );
    });
  });

  describe('create', () => {
    it('should create a new reservation', async () => {
      // Arrange
      const newReservation: Partial<Reservation> = {
        spaceId: 1,
        userEmail: 'test@example.com',
        reservationDate: new Date('2023-01-01'),
        startTime: new Date('2023-01-01T10:00:00.000Z'),
        endTime: new Date('2023-01-01T12:00:00.000Z'),
      };
      mockTypeOrmRepository.create.mockReturnValue({
        ...mockReservationEntity,
        ...newReservation,
      } as ReservationEntity);
      mockTypeOrmRepository.save.mockResolvedValue({
        ...mockReservationEntity,
        ...newReservation,
      } as ReservationEntity);

      // Act
      const result = await reservationRepository.create(newReservation);

      // Assert
      expect(result).toEqual({
        ...mockReservation,
        ...newReservation,
      });
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(newReservation);
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });

    it('should handle errors during create', async () => {
      // Arrange
      mockTypeOrmRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        reservationRepository.create({
          spaceId: 1,
          userEmail: 'test@example.com',
          reservationDate: new Date(),
          startTime: new Date(),
          endTime: new Date(),
        }),
      ).rejects.toThrow('Error creating reservation: Database error');
    });
  });

  describe('update', () => {
    it('should update an existing reservation', async () => {
      // Arrange
      const id = 1;
      const updateData: Partial<Reservation> = {
        reservationDate: new Date('2023-01-02'),
        startTime: new Date('2023-01-02T10:00:00.000Z'),
        endTime: new Date('2023-01-02T12:00:00.000Z'),
      };
      const updatedEntity = {
        ...mockReservationEntity,
        ...updateData,
      };

      // Mock findOne to return an entity first (for the update method)
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(
        mockReservationEntity,
      );

      // Mock save to return the updated entity
      mockTypeOrmRepository.save.mockResolvedValueOnce(updatedEntity);

      // Act
      const result = await reservationRepository.update(id, updateData);

      // Assert
      expect(result).toEqual({
        ...mockReservation,
        ...updateData,
      });
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });

    it('should handle errors during update', async () => {
      // Arrange
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(
        mockReservationEntity,
      );
      mockTypeOrmRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        reservationRepository.update(1, { reservationDate: new Date() }),
      ).rejects.toThrow('Error updating reservation: Database error');
    });

    it('should throw error if reservation not found during update', async () => {
      // Arrange
      const id = 999;
      const updateData: Partial<Reservation> = {
        reservationDate: new Date('2023-01-02'),
      };

      // Mock findOne to return null (reservation not found)
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        reservationRepository.update(id, updateData),
      ).rejects.toThrow(
        `Error updating reservation: Space with id ${id} does not exist`,
      );

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(mockTypeOrmRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a reservation', async () => {
      // Arrange
      const id = 1;
      mockTypeOrmRepository.delete.mockResolvedValue({
        affected: 1,
        raw: {},
      });

      // Act
      await reservationRepository.delete(id);

      // Assert
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should handle errors during delete', async () => {
      // Arrange
      mockTypeOrmRepository.delete.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(reservationRepository.delete(1)).rejects.toThrow(
        'Error deleting reservation: Database error',
      );
    });
  });

  describe('mapToDomain', () => {
    it('should correctly map entity to domain model', () => {
      // Arrange
      const testEntity: ReservationEntity = {
        id: 5,
        spaceId: 2,
        space: null,
        userEmail: 'maptest@example.com',
        reservationDate: new Date('2023-05-05'),
        startTime: new Date('2023-05-05T14:00:00.000Z'),
        endTime: new Date('2023-05-05T16:00:00.000Z'),
        createdAt: new Date('2023-05-05T00:00:00.000Z'),
        updatedAt: new Date('2023-05-05T00:00:00.000Z'),
      };

      // Expected domain model after mapping
      const expectedDomainModel = {
        id: 5,
        spaceId: 2,
        userEmail: 'maptest@example.com',
        reservationDate: new Date('2023-05-05'),
        startTime: new Date('2023-05-05T14:00:00.000Z'),
        endTime: new Date('2023-05-05T16:00:00.000Z'),
        createdAt: new Date('2023-05-05T00:00:00.000Z'),
        updatedAt: new Date('2023-05-05T00:00:00.000Z'),
      };

      // Reset mock and set up new response
      mockTypeOrmRepository.findOne.mockReset();
      mockTypeOrmRepository.findOne.mockResolvedValue(testEntity);

      // Act
      return reservationRepository.findById(5).then((result) => {
        // Assert
        expect(result).toEqual(expectedDomainModel);
      });
    });
  });
});
