import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { SpaceRepositoryPort } from '../../../domain/repositories/space.repository.port';
import { IApiResponse } from '../../../infrastructure/dtos/api-response.dto';

@Injectable()
export class CreateSpaceUseCase {
  constructor(
    @Inject('SpaceRepositoryPort')
    private readonly spaceRepository: SpaceRepositoryPort,
  ) {}

  async execute(
    name: string,
    location: string,
    capacity: number,
    description?: string,
  ): Promise<IApiResponse<{ id: number }>> {
    try {
      const space = await this.spaceRepository.create({
        name,
        location,
        capacity,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Space created successfully',
        data: { id: space.id },
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error creating space',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
