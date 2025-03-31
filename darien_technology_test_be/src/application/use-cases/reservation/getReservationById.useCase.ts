import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { ReservationRepositoryPort } from '../../../domain/repositories/reservation.repository.port';
import { IApiResponse } from '../../../infrastructure/dtos/api-response.dto';

@Injectable()
export class GetReservationByIdUseCase {
  constructor(
    @Inject('ReservationRepositoryPort')
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(id: number): Promise<IApiResponse<any>> {
    try {
      const reservation = await this.reservationRepository.findById(id);
      if (!reservation) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Reservation with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Reservation retrieved successfully',
        data: reservation,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error retrieving reservation',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
