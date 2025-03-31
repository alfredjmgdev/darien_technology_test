import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { ReservationRepositoryPort } from '../../../domain/repositories/reservation.repository.port';
import { IApiResponse } from '../../../infrastructure/dtos/api-response.dto';

@Injectable()
export class GetReservationsUseCase {
  constructor(
    @Inject('ReservationRepositoryPort')
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(
    page: number = 1,
    limit: number = 10,
  ): Promise<IApiResponse<{ reservations: any[]; pagination: any }>> {
    try {
      const { reservations, total } = await this.reservationRepository.findAll(
        page,
        limit,
      );

      const totalPages = Math.ceil(total / limit);

      return {
        statusCode: HttpStatus.OK,
        message: 'Reservations retrieved successfully',
        data: {
          reservations,
          pagination: {
            total: Number(total),
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
          },
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error retrieving reservations',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
