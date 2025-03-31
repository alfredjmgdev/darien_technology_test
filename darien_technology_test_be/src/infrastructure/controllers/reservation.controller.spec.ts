import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { ReservationController } from './reservation.controller';
import { CreateReservationUseCase } from '../../application/use-cases/reservation/createReservation.useCase';
import { GetReservationsUseCase } from '../../application/use-cases/reservation/getReservations.useCase';
import { GetReservationByIdUseCase } from '../../application/use-cases/reservation/getReservationById.useCase';
import { UpdateReservationUseCase } from '../../application/use-cases/reservation/updateReservation.useCase';
import { DeleteReservationUseCase } from '../../application/use-cases/reservation/deleteReservation.useCase';
import { Reservation } from '../../domain/entities/reservation.entity';
import { UpdateReservationDto } from '../dtos/reservation.dto';

describe('ReservationController', () => {
  let controller: ReservationController;
  let createReservationUseCase: CreateReservationUseCase;
  let getReservationsUseCase: GetReservationsUseCase;
  let getReservationByIdUseCase: GetReservationByIdUseCase;
  let updateReservationUseCase: UpdateReservationUseCase;
  let deleteReservationUseCase: DeleteReservationUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: CreateReservationUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetReservationsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetReservationByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateReservationUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeleteReservationUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
    createReservationUseCase = module.get<CreateReservationUseCase>(
      CreateReservationUseCase,
    );
    getReservationsUseCase = module.get<GetReservationsUseCase>(
      GetReservationsUseCase,
    );
    getReservationByIdUseCase = module.get<GetReservationByIdUseCase>(
      GetReservationByIdUseCase,
    );
    updateReservationUseCase = module.get<UpdateReservationUseCase>(
      UpdateReservationUseCase,
    );
    deleteReservationUseCase = module.get<DeleteReservationUseCase>(
      DeleteReservationUseCase,
    );
  });

  describe('createReservation', () => {
    const createReservationDto = {
      spaceId: 1,
      reservationDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
    };

    const mockRequest = {
      user: {
        email: 'test@example.com',
      },
    } as Request & { user: { email: string } };

    it('should create a reservation successfully', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: 'Reservation created successfully',
        data: { id: 1 },
      };

      jest
        .spyOn(createReservationUseCase, 'execute')
        .mockResolvedValue(expectedResponse);

      const result = await controller.createReservation(
        createReservationDto,
        mockRequest,
      );

      expect(result).toEqual(expectedResponse);
      expect(createReservationUseCase.execute).toHaveBeenCalledWith(
        createReservationDto.spaceId,
        mockRequest.user.email,
        createReservationDto.reservationDate,
        createReservationDto.startTime,
        createReservationDto.endTime,
      );
    });

    it('should handle errors when creating a reservation', async () => {
      const httpError = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid reservation data',
        error: 'Bad Request',
      };

      jest
        .spyOn(createReservationUseCase, 'execute')
        .mockRejectedValue(httpError);

      try {
        await controller.createReservation(createReservationDto, mockRequest);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(httpError);
      }

      expect(createReservationUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('getReservations', () => {
    const expectedResponse = {
      statusCode: HttpStatus.OK,
      message: 'Reservations retrieved successfully',
      data: {
        reservations: [] as Reservation[],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
        },
      },
    };

    beforeEach(() => {
      jest
        .spyOn(getReservationsUseCase, 'execute')
        .mockResolvedValue(expectedResponse);
    });

    it('should get reservations with explicit pagination parameters', async () => {
      const result = await controller.getReservations(1, 10);

      expect(result).toEqual(expectedResponse);
      expect(getReservationsUseCase.execute).toHaveBeenCalledWith(1, 10);
    });

    // Test for default page parameter (branch coverage)
    it('should get reservations with default page parameter', async () => {
      const result = await controller.getReservations(undefined, 10);

      expect(result).toEqual(expectedResponse);
      expect(getReservationsUseCase.execute).toHaveBeenCalledWith(1, 10); // 1 is the default value
    });

    // Test for default limit parameter (branch coverage)
    it('should get reservations with default limit parameter', async () => {
      const result = await controller.getReservations(2, undefined);

      expect(result).toEqual(expectedResponse);
      expect(getReservationsUseCase.execute).toHaveBeenCalledWith(2, 10); // 10 is the default value
    });

    // Test for both default parameters (branch coverage)
    it('should get reservations with both default parameters', async () => {
      const result = await controller.getReservations(undefined, undefined);

      expect(result).toEqual(expectedResponse);
      expect(getReservationsUseCase.execute).toHaveBeenCalledWith(1, 10); // Both default values
    });

    it('should handle errors when getting reservations', async () => {
      const httpError = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving reservations',
        error: 'Internal Server Error',
      };

      jest
        .spyOn(getReservationsUseCase, 'execute')
        .mockRejectedValue(httpError);

      try {
        await controller.getReservations();
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(httpError);
      }
    });
  });

  describe('getReservationById', () => {
    it('should get a reservation by id', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: 'Reservation retrieved successfully',
        data: { id: 1 },
      };

      jest
        .spyOn(getReservationByIdUseCase, 'execute')
        .mockResolvedValue(expectedResponse);

      const result = await controller.getReservationById(1);

      expect(result).toEqual(expectedResponse);
      expect(getReservationByIdUseCase.execute).toHaveBeenCalledWith(1);
    });

    it('should handle errors when getting a reservation by id', async () => {
      const httpError = {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Reservation not found',
        error: 'Not Found',
      };

      jest
        .spyOn(getReservationByIdUseCase, 'execute')
        .mockRejectedValue(httpError);

      try {
        await controller.getReservationById(999);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(httpError);
      }
    });
  });

  describe('updateReservation', () => {
    const updateReservationDto = {
      reservationDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
    };

    it('should update a reservation successfully', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: 'Reservation updated successfully',
        data: { id: 1 },
      };

      jest
        .spyOn(updateReservationUseCase, 'execute')
        .mockResolvedValue(expectedResponse);

      const result = await controller.updateReservation(
        1,
        updateReservationDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(updateReservationUseCase.execute).toHaveBeenCalledWith(
        1,
        updateReservationDto,
      );
    });

    it('should handle errors when updating a reservation', async () => {
      const httpError = {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Reservation not found',
        error: 'Not Found',
      };

      jest
        .spyOn(updateReservationUseCase, 'execute')
        .mockRejectedValue(httpError);

      try {
        await controller.updateReservation(999, updateReservationDto);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(httpError);
      }
    });

    it('should update a reservation with partial data', async () => {
      const partialUpdateDto = {
        reservationDate: new Date(),
      };

      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: 'Reservation updated successfully',
        data: { id: 1 },
      };

      jest
        .spyOn(updateReservationUseCase, 'execute')
        .mockResolvedValue(expectedResponse);

      const result = await controller.updateReservation(
        1,
        partialUpdateDto as UpdateReservationDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(updateReservationUseCase.execute).toHaveBeenCalledWith(
        1,
        partialUpdateDto,
      );
    });
  });

  describe('deleteReservation', () => {
    const mockRequest = {
      user: {
        email: 'test@example.com',
      },
    } as Request & { user: { email: string } };

    it('should delete a reservation successfully', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Reservation deleted successfully',
      };

      jest
        .spyOn(deleteReservationUseCase, 'execute')
        .mockResolvedValue(expectedResponse);

      const result = await controller.deleteReservation(1, mockRequest);

      expect(result).toEqual(expectedResponse);
      expect(deleteReservationUseCase.execute).toHaveBeenCalledWith(
        1,
        mockRequest.user.email,
      );
    });

    it('should handle errors when deleting a reservation', async () => {
      const httpError = {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Not authorized to delete this reservation',
        error: 'Forbidden',
      };

      jest
        .spyOn(deleteReservationUseCase, 'execute')
        .mockRejectedValue(httpError);

      try {
        await controller.deleteReservation(1, mockRequest);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(httpError);
      }

      expect(deleteReservationUseCase.execute).toHaveBeenCalledWith(
        1,
        mockRequest.user.email,
      );
    });

    it('should handle not found errors when deleting a reservation', async () => {
      const httpError = {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Reservation not found',
        error: 'Not Found',
      };

      jest
        .spyOn(deleteReservationUseCase, 'execute')
        .mockRejectedValue(httpError);

      try {
        await controller.deleteReservation(999, mockRequest);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(httpError);
      }
    });
  });
});
