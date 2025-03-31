import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { ReservationRepositoryPort } from '../../../domain/repositories/reservation.repository.port';
import { SpaceRepositoryPort } from '../../../domain/repositories/space.repository.port';
import * as moment from 'moment';
import { IApiResponse } from '../../../infrastructure/dtos/api-response.dto';

@Injectable()
export class CreateReservationUseCase {
  constructor(
    @Inject('ReservationRepositoryPort')
    private readonly reservationRepository: ReservationRepositoryPort,
    @Inject('SpaceRepositoryPort')
    private readonly spaceRepository: SpaceRepositoryPort,
  ) {}

  async execute(
    spaceId: number,
    userEmail: string,
    reservationDate: Date,
    startTime: Date | string,
    endTime: Date | string,
  ): Promise<IApiResponse<{ id: number }>> {
    try {
      // Parse dates correctly to avoid timezone issues
      const parsedStartTime = parseTimeWithoutTimezoneShift(startTime);
      const parsedEndTime = parseTimeWithoutTimezoneShift(endTime);

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

      if (moment(reservationDate).isBefore(moment().startOf('day'))) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Reservation date cannot be in the past',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const space = await this.spaceRepository.findById(spaceId);
      if (!space) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Space with ID ${spaceId} not found`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const conflictingReservations =
        await this.reservationRepository.findBySpaceAndTimeRange(
          spaceId,
          parsedStartTime,
          parsedEndTime,
        );

      if (conflictingReservations.length > 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message:
              'There is already a reservation for this space at the specified time',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const weekStart = moment(reservationDate).startOf('week').toDate();
      const weekEnd = moment(reservationDate).endOf('week').toDate();

      const userReservationsThisWeek =
        await this.reservationRepository.findByUserEmail(
          userEmail,
          weekStart,
          weekEnd,
        );

      console.log(weekStart);
      console.log(weekEnd);
      console.log(userReservationsThisWeek.length);

      if (userReservationsThisWeek.length >= 3) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `You have reached the maximum number of reservations allowed for the week starting on ${moment(weekStart).format('YYYY-MM-DD')} (3)`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const reservation = await this.reservationRepository.create({
        spaceId,
        userEmail,
        reservationDate,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        createdAt: new Date(),
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Reservation created successfully',
        data: { id: reservation.id },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error creating reservation',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
