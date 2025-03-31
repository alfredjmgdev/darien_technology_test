import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { ReservationRepositoryPort } from '../../../domain/repositories/reservation.repository.port';
import { IApiResponse } from '../../../infrastructure/dtos/api-response.dto';

@Injectable()
export class DeleteReservationUseCase {
  constructor(
    @Inject('ReservationRepositoryPort')
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(id: number, userEmail: string): Promise<IApiResponse<void>> {
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

      if (reservation.userEmail !== userEmail) {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'You are not authorized to delete this reservation',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      await this.reservationRepository.delete(id);

      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Reservation deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error deleting reservation',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
