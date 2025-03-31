import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { SpaceRepositoryPort } from '../../../domain/repositories/space.repository.port';
import { ReservationRepositoryPort } from '../../../domain/repositories/reservation.repository.port';
import { IApiResponse } from '../../../infrastructure/dtos/api-response.dto';

@Injectable()
export class DeleteSpaceUseCase {
  constructor(
    @Inject('SpaceRepositoryPort')
    private readonly spaceRepository: SpaceRepositoryPort,
    @Inject('ReservationRepositoryPort')
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(id: number): Promise<IApiResponse<void>> {
    try {
      const space = await this.spaceRepository.findById(id);
      if (!space) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Space with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const reservations =
        await this.reservationRepository.findAllWithoutPagination(
          { spaceId: id },
          [],
          [],
        );

      if (reservations && reservations.length > 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Cannot delete space with existing reservations',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.spaceRepository.delete(id);
      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Space deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error deleting space',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
