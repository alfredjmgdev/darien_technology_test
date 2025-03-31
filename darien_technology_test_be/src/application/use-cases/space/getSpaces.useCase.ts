import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { SpaceRepositoryPort } from '../../../domain/repositories/space.repository.port';
import { IApiResponse } from '../../../infrastructure/dtos/api-response.dto';

@Injectable()
export class GetSpacesUseCase {
  constructor(
    @Inject('SpaceRepositoryPort')
    private readonly spaceRepository: SpaceRepositoryPort,
  ) {}

  async execute(
    page: number = 1,
    limit: number = 10,
  ): Promise<IApiResponse<{ spaces: any[]; pagination: any }>> {
    try {
      const { spaces, total } = await this.spaceRepository.findAll(page, limit);
      const totalPages = Math.ceil(total / limit);

      return {
        statusCode: HttpStatus.OK,
        message: 'Spaces retrieved successfully',
        data: {
          spaces,
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
          message: 'Error retrieving spaces',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
