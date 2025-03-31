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
    data: {
      reservationDate?: Date;
      startTime?: Date | string;
      endTime?: Date | string;
    },
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

      // Parse dates correctly to avoid timezone issues
      const parsedData = {
        ...data,
        reservationDate: data.reservationDate,
        startTime: data.startTime
          ? parseTimeWithoutTimezoneShift(data.startTime)
          : undefined,
        endTime: data.endTime
          ? parseTimeWithoutTimezoneShift(data.endTime)
          : undefined,
      };

      // Helper function to parse time strings without timezone shift
      function parseTimeWithoutTimezoneShift(timeValue: Date | string): Date {
        if (timeValue instanceof Date) {
          return timeValue;
        }

        // For ISO string format (e.g., "2025-04-30T16:00:00")
        const [datePart, timePart] = timeValue.split('T');
        if (datePart && timePart) {
          const [year, month, day] = datePart.split('-').map(Number);
          const [hours, minutes, seconds] = timePart.split(':').map(Number);

          // Create date with explicit UTC time to avoid timezone conversion
          return new Date(
            Date.UTC(year, month - 1, day, hours, minutes, seconds || 0),
          );
        }

        // Fallback to regular parsing if format is unexpected
        return new Date(timeValue);
      }

      if (parsedData.startTime || parsedData.endTime) {
        const startTime = parsedData.startTime || reservation.startTime;
        const endTime = parsedData.endTime || reservation.endTime;

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
        reservationDate: parsedData.reservationDate,
        startTime: parsedData.startTime,
        endTime: parsedData.endTime,
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
