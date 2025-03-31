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
    startTime: Date,
    endTime: Date,
  ): Promise<IApiResponse<{ id: number }>> {
    try {
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
          startTime,
          endTime,
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
        startTime,
        endTime,
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
