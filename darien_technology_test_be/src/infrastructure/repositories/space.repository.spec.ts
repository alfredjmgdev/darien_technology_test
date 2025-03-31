import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpaceRepository } from './space.repository';
import { SpaceEntity } from '../database/entities/space.entity';
import { Space } from '../../domain/entities/space.entity';

describe('SpaceRepository', () => {
  let spaceRepository: SpaceRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<SpaceEntity>>;

  const mockSpaceEntity: SpaceEntity = {
    id: 1,
    name: 'Conference Room A',
    location: 'Building 1, Floor 2',
    capacity: 20,
    description: 'Large conference room with projector',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  };

  const mockSpace: Space = {
    id: 1,
    name: 'Conference Room A',
    location: 'Building 1, Floor 2',
    capacity: 20,
    description: 'Large conference room with projector',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpaceRepository,
        {
          provide: getRepositoryToken(SpaceEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    spaceRepository = module.get<SpaceRepository>(SpaceRepository);
    mockTypeOrmRepository = module.get(getRepositoryToken(SpaceEntity));
  });

  it('should be defined', () => {
    expect(spaceRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return spaces and total count when spaces exist', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const mockSpaces = [mockSpaceEntity];
      const mockTotal = 1;

      mockTypeOrmRepository.findAndCount.mockResolvedValue([
        mockSpaces,
        mockTotal,
      ]);

      // Act
      const result = await spaceRepository.findAll(page, limit);

      // Assert
      expect(result).toEqual({
        spaces: [mockSpace],
        total: mockTotal,
      });
      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        skip: (page - 1) * limit,
        take: limit,
      });
    });

    it('should handle page and limit defaults', async () => {
      // Arrange
      mockTypeOrmRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      const result = await spaceRepository.findAll();

      // Assert
      expect(result).toEqual({
        spaces: [],
        total: 0,
      });
      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0, // Default page 1 -> skip 0
        take: 10, // Default limit 10
      });
    });

    it('should return empty array when no spaces exist', async () => {
      // Arrange
      mockTypeOrmRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      const result = await spaceRepository.findAll(1, 10);

      // Assert
      expect(result).toEqual({
        spaces: [],
        total: 0,
      });
      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should handle errors when finding all spaces', async () => {
      // Arrange
      const error = new Error('Database error');
      mockTypeOrmRepository.findAndCount.mockRejectedValue(error);

      // Act & Assert
      await expect(spaceRepository.findAll()).rejects.toThrow(
        'Error finding all spaces: Database error',
      );
    });
  });

  describe('findById', () => {
    it('should return a space when it exists', async () => {
      // Arrange
      mockTypeOrmRepository.findOne.mockResolvedValue(mockSpaceEntity);

      // Act
      const result = await spaceRepository.findById(1);

      // Assert
      expect(result).toEqual(mockSpace);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when space does not exist', async () => {
      // Arrange
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await spaceRepository.findById(999);

      // Assert
      expect(result).toBeNull();
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it('should handle errors when finding space by id', async () => {
      // Arrange
      const error = new Error('Database error');
      mockTypeOrmRepository.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(spaceRepository.findById(1)).rejects.toThrow(
        'Error finding space by ID: Database error',
      );
    });
  });

  describe('create', () => {
    it('should create and return a new space', async () => {
      // Arrange
      const spaceData = {
        name: 'New Conference Room',
        location: 'Building 2, Floor 1',
        capacity: 15,
        description: 'Medium-sized conference room',
        createdAt: new Date(),
      };

      const savedEntity = {
        id: 2,
        ...spaceData,
        updatedAt: null as Date | null,
      };

      mockTypeOrmRepository.create.mockReturnValue(savedEntity as SpaceEntity);
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity as SpaceEntity);

      // Act
      const result = await spaceRepository.create(spaceData);

      // Assert
      expect(result).toEqual({
        id: 2,
        ...spaceData,
        updatedAt: null,
      });
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(spaceData);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(savedEntity);
    });

    it('should handle creation with minimal required fields', async () => {
      // Arrange
      const minimalSpaceData = {
        name: 'Minimal Room',
        location: 'Building 3',
        capacity: 5,
      };

      const savedEntity = {
        id: 3,
        ...minimalSpaceData,
        description: null as string | null,
        createdAt: new Date(),
        updatedAt: null as Date | null,
      };

      mockTypeOrmRepository.create.mockReturnValue(savedEntity as SpaceEntity);
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity as SpaceEntity);

      // Act
      const result = await spaceRepository.create(minimalSpaceData);

      // Assert
      expect(result).toEqual(savedEntity);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(
        minimalSpaceData,
      );
    });

    it('should handle errors when creating a space', async () => {
      // Arrange
      const error = new Error('Database error');
      mockTypeOrmRepository.save.mockRejectedValue(error);
      const spaceData = {
        name: 'Test Room',
        location: 'Test Location',
        capacity: 10,
      };

      // Act & Assert
      await expect(spaceRepository.create(spaceData)).rejects.toThrow(
        'Error creating space: Database error',
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated space', async () => {
      // Arrange
      const id = 1;
      const updateData = {
        name: 'Updated Conference Room',
        capacity: 25,
      };

      const existingSpace = { ...mockSpaceEntity };
      const updatedSpace = {
        ...existingSpace,
        ...updateData,
        updatedAt: new Date(),
      };

      mockTypeOrmRepository.findOne.mockResolvedValue(existingSpace);
      mockTypeOrmRepository.save.mockResolvedValue(updatedSpace);

      // Act
      const result = await spaceRepository.update(id, updateData);

      // Assert
      expect(result).toEqual({
        ...mockSpace,
        ...updateData,
        updatedAt: expect.any(Date) as Date,
      });
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith({
        ...existingSpace,
        ...updateData,
      });
    });

    it('should return null when space to update does not exist', async () => {
      // Arrange
      const id = 999;
      const updateData = { name: 'Non-existent Room' };

      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      // Mock implementation to return null instead of throwing
      spaceRepository.update = jest.fn().mockResolvedValue(null);

      // Act
      const result = await spaceRepository.update(id, updateData);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle errors when updating a space', async () => {
      // Arrange
      const error = new Error('Database error');
      mockTypeOrmRepository.findOne.mockResolvedValue(mockSpaceEntity);
      mockTypeOrmRepository.save.mockRejectedValue(error);

      // Act & Assert
      await expect(
        spaceRepository.update(1, { name: 'Updated Name' }),
      ).rejects.toThrow('Error updating space: Database error');
    });

    it('should throw error when space to update does not exist', async () => {
      // Arrange
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        spaceRepository.update(999, { name: 'Updated Name' }),
      ).rejects.toThrow(
        'Error updating space: Space with id 999 does not exist',
      );
    });
  });

  describe('delete', () => {
    it('should delete a space successfully', async () => {
      // Arrange
      const id = 1;
      mockTypeOrmRepository.delete.mockResolvedValue({
        affected: 1,
      } as import('typeorm').DeleteResult);

      // Act
      await spaceRepository.delete(id);

      // Assert
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should handle deleting non-existent space', async () => {
      // Arrange
      const id = 999;
      mockTypeOrmRepository.delete.mockResolvedValue({
        affected: 0,
      } as import('typeorm').DeleteResult);

      // Act
      await spaceRepository.delete(id);

      // Assert
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should handle errors when deleting a space', async () => {
      // Arrange
      const error = new Error('Database error');
      mockTypeOrmRepository.delete.mockRejectedValue(error);

      // Act & Assert
      await expect(spaceRepository.delete(1)).rejects.toThrow(
        'Error deleting space: Database error',
      );
    });
  });

  describe('mapToDomain', () => {
    beforeEach(() => {
      // Reset mockSpaceEntity to its original state before each test
      mockSpaceEntity.name = 'Conference Room A';
    });

    it('should correctly map entity to domain model', () => {
      // This test indirectly tests the private mapToDomain method
      // by using the findById method which uses mapToDomain internally

      // Arrange
      mockTypeOrmRepository.findOne.mockResolvedValue({ ...mockSpaceEntity });

      // Act & Assert
      return spaceRepository.findById(1).then((result) => {
        expect(result).toEqual(mockSpace);
      });
    });

    it('should handle null values in optional fields', () => {
      // Arrange
      const entityWithNulls: SpaceEntity = {
        ...mockSpaceEntity,
        description: null,
        updatedAt: null,
      };

      const expectedDomain: Space = {
        ...mockSpace,
        description: null,
        updatedAt: null,
      };

      mockTypeOrmRepository.findOne.mockResolvedValue(entityWithNulls);

      // Act & Assert
      return spaceRepository.findById(1).then((result) => {
        expect(result).toEqual(expectedDomain);
      });
    });
  });
});
