import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { SpaceRepositoryPort } from '../../../domain/repositories/space.repository.port';
import { IApiResponse } from '../../../infrastructure/dtos/api-response.dto';

@Injectable()
export class GetSpaceByIdUseCase {
  constructor(
    @Inject('SpaceRepositoryPort')
    private readonly spaceRepository: SpaceRepositoryPort,
  ) {}

  async execute(id: number): Promise<IApiResponse<any>> {
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

      return {
        statusCode: HttpStatus.OK,
        message: 'Space retrieved successfully',
        data: space,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error retrieving space',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
