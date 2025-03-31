import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { ReservationRepositoryPort } from '../../../domain/repositories/reservation.repository.port';
import { IApiResponse } from '../../../infrastructure/dtos/api-response.dto';

@Injectable()
export class UpdateReservationUseCase {
  constructor(
    @Inject('ReservationRepositoryPort')
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(
    id: number,
    data: { reservationDate?: Date; startTime?: Date; endTime?: Date },
  ): Promise<IApiResponse<{ id: number }>> {
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

      if (data.startTime || data.endTime) {
        const startTime = data.startTime || reservation.startTime;
        const endTime = data.endTime || reservation.endTime;

        const conflictingReservations =
          await this.reservationRepository.findBySpaceAndTimeRange(
            reservation.spaceId,
            startTime,
            endTime,
          );

        const conflicts = conflictingReservations.filter((r) => r.id !== id);

        if (conflicts.length > 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message:
                'There is already a reservation for this space at the specified time',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const updatedReservation = await this.reservationRepository.update(id, {
        ...data,
        updatedAt: new Date(),
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Reservation updated successfully',
        data: { id: updatedReservation.id },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error updating reservation',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
