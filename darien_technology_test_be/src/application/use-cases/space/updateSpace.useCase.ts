import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { SpaceRepositoryPort } from '../../../domain/repositories/space.repository.port';
import { IApiResponse } from '../../../infrastructure/dtos/api-response.dto';

@Injectable()
export class UpdateSpaceUseCase {
  constructor(
    @Inject('SpaceRepositoryPort')
    private readonly spaceRepository: SpaceRepositoryPort,
  ) {}

  async execute(
    id: number,
    data: {
      name?: string;
      location?: string;
      capacity?: number;
      description?: string;
    },
  ): Promise<IApiResponse<{ id: number }>> {
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

      const updatedSpace = await this.spaceRepository.update(id, {
        ...data,
        updatedAt: new Date(),
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Space updated successfully',
        data: { id: updatedSpace.id },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error updating space',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
