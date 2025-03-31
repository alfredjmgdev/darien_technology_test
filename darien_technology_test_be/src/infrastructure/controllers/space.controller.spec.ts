import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { CreateSpaceUseCase } from '../../application/use-cases/space/createSpace.useCase';
import { GetSpacesUseCase } from '../../application/use-cases/space/getSpaces.useCase';
import { GetSpaceByIdUseCase } from '../../application/use-cases/space/getSpaceById.useCase';
import { UpdateSpaceUseCase } from '../../application/use-cases/space/updateSpace.useCase';
import { DeleteSpaceUseCase } from '../../application/use-cases/space/deleteSpace.useCase';
import { Space } from 'src/domain/entities/space.entity';

describe('SpaceController', () => {
  let controller: SpaceController;
  let createSpaceUseCase: CreateSpaceUseCase;
  let getSpacesUseCase: GetSpacesUseCase;
  let getSpaceByIdUseCase: GetSpaceByIdUseCase;
  let updateSpaceUseCase: UpdateSpaceUseCase;
  let deleteSpaceUseCase: DeleteSpaceUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpaceController],
      providers: [
        {
          provide: CreateSpaceUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetSpacesUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetSpaceByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateSpaceUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeleteSpaceUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SpaceController>(SpaceController);
    createSpaceUseCase = module.get<CreateSpaceUseCase>(CreateSpaceUseCase);
    getSpacesUseCase = module.get<GetSpacesUseCase>(GetSpacesUseCase);
    getSpaceByIdUseCase = module.get<GetSpaceByIdUseCase>(GetSpaceByIdUseCase);
    updateSpaceUseCase = module.get<UpdateSpaceUseCase>(UpdateSpaceUseCase);
    deleteSpaceUseCase = module.get<DeleteSpaceUseCase>(DeleteSpaceUseCase);
  });

  describe('createSpace', () => {
    const createSpaceDto = {
      name: 'Test Space',
      location: 'Test Location',
      capacity: 10,
      description: 'Test Description',
    };

    it('should create a space successfully', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: 'Space created successfully',
        data: { id: 1 },
      };

      jest
        .spyOn(createSpaceUseCase, 'execute')
        .mockResolvedValue(expectedResponse);

      const result = await controller.createSpace(createSpaceDto);

      expect(result).toEqual(expectedResponse);
      expect(createSpaceUseCase.execute).toHaveBeenCalledWith(
        createSpaceDto.name,
        createSpaceDto.location,
        createSpaceDto.capacity,
        createSpaceDto.description,
      );
    });

    it('should create a space without description', async () => {
      const dtoWithoutDescription = {
        name: 'Test Space',
        location: 'Test Location',
        capacity: 10,
      } as Space;

      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: 'Space created successfully',
        data: { id: 1 },
      };

      jest
        .spyOn(createSpaceUseCase, 'execute')
        .mockResolvedValue(expectedResponse);

      const result = await controller.createSpace(dtoWithoutDescription);

      expect(result).toEqual(expectedResponse);
      expect(createSpaceUseCase.execute).toHaveBeenCalledWith(
        dtoWithoutDescription.name,
        dtoWithoutDescription.location,
        dtoWithoutDescription.capacity,
        undefined,
      );
    });

    it('should handle errors when creating a space', async () => {
      const httpError = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid space data',
        error: 'Bad Request',
      };

      jest.spyOn(createSpaceUseCase, 'execute').mockRejectedValue(httpError);

      try {
        await controller.createSpace(createSpaceDto);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(httpError);
      }
    });
  });

  describe('getSpaces', () => {
    const expectedResponse = {
      statusCode: HttpStatus.OK,
      message: 'Spaces retrieved successfully',
      data: {
        spaces: [{ id: 1, name: 'Test Space' }],
        pagination: {
          total: 1,
          page: 1,
          totalPages: 1,
          limit: 10,
        },
      },
    };

    beforeEach(() => {
      jest
        .spyOn(getSpacesUseCase, 'execute')
        .mockResolvedValue(expectedResponse);
    });

    it('should get spaces with explicit pagination parameters', async () => {
      const result = await controller.getSpaces(1, 10);

      expect(result).toEqual(expectedResponse);
      expect(getSpacesUseCase.execute).toHaveBeenCalledWith(1, 10);
    });

    // Test for default page parameter (branch coverage)
    it('should get spaces with default page parameter', async () => {
      const result = await controller.getSpaces(undefined, 10);

      expect(result).toEqual(expectedResponse);
      expect(getSpacesUseCase.execute).toHaveBeenCalledWith(1, 10); // 1 is the default value
    });

    // Test for default limit parameter (branch coverage)
    it('should get spaces with default limit parameter', async () => {
      const result = await controller.getSpaces(2, undefined);

      expect(result).toEqual(expectedResponse);
      expect(getSpacesUseCase.execute).toHaveBeenCalledWith(2, 10); // 10 is the default value
    });

    // Test for both default parameters (branch coverage)
    it('should get spaces with both default parameters', async () => {
      const result = await controller.getSpaces(undefined, undefined);

      expect(result).toEqual(expectedResponse);
      expect(getSpacesUseCase.execute).toHaveBeenCalledWith(1, 10); // Both default values
    });

    it('should handle errors when getting spaces', async () => {
      const httpError = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving spaces',
        error: 'Internal Server Error',
      };

      jest.spyOn(getSpacesUseCase, 'execute').mockRejectedValue(httpError);

      try {
        await controller.getSpaces();
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(httpError);
      }
    });
  });

  describe('getSpaceById', () => {
    it('should get a space by id', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: 'Space retrieved successfully',
        data: { id: 1, name: 'Test Space' },
      };

      jest
        .spyOn(getSpaceByIdUseCase, 'execute')
        .mockResolvedValue(expectedResponse);

      const result = await controller.getSpaceById(1);

      expect(result).toEqual(expectedResponse);
      expect(getSpaceByIdUseCase.execute).toHaveBeenCalledWith(1);
    });

    it('should handle errors when getting a space by id', async () => {
      const httpError = {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Space not found',
        error: 'Not Found',
      };

      jest.spyOn(getSpaceByIdUseCase, 'execute').mockRejectedValue(httpError);

      try {
        await controller.getSpaceById(999);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(httpError);
      }
    });
  });

  describe('updateSpace', () => {
    const updateSpaceDto = {
      name: 'Updated Space',
      location: 'Updated Location',
      capacity: 20,
      description: 'Updated Description',
    };

    it('should update a space successfully', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: 'Space updated successfully',
        data: { id: 1 },
      };

      jest
        .spyOn(updateSpaceUseCase, 'execute')
        .mockResolvedValue(expectedResponse);

      const result = await controller.updateSpace(1, updateSpaceDto);

      expect(result).toEqual(expectedResponse);
      expect(updateSpaceUseCase.execute).toHaveBeenCalledWith(
        1,
        updateSpaceDto,
      );
    });

    it('should handle errors when updating a space', async () => {
      const httpError = {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Space not found',
        error: 'Not Found',
      };

      jest.spyOn(updateSpaceUseCase, 'execute').mockRejectedValue(httpError);

      try {
        await controller.updateSpace(999, updateSpaceDto);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(httpError);
      }
    });
  });

  describe('deleteSpace', () => {
    it('should delete a space successfully', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Space deleted successfully',
      };

      jest
        .spyOn(deleteSpaceUseCase, 'execute')
        .mockResolvedValue(expectedResponse);

      const result = await controller.deleteSpace(1);

      expect(result).toEqual(expectedResponse);
      expect(deleteSpaceUseCase.execute).toHaveBeenCalledWith(1);
    });

    it('should handle errors when deleting a space', async () => {
      const httpError = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cannot delete space with existing reservations',
        error: 'Bad Request',
      };

      jest.spyOn(deleteSpaceUseCase, 'execute').mockRejectedValue(httpError);

      try {
        await controller.deleteSpace(1);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(httpError);
      }

      expect(deleteSpaceUseCase.execute).toHaveBeenCalledWith(1);
    });

    it('should handle unexpected errors when deleting a space', async () => {
      const unexpectedError = new Error('Unexpected error');

      jest
        .spyOn(deleteSpaceUseCase, 'execute')
        .mockRejectedValue(unexpectedError);

      try {
        await controller.deleteSpace(1);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(unexpectedError);
      }

      expect(deleteSpaceUseCase.execute).toHaveBeenCalledWith(1);
    });
  });
});
