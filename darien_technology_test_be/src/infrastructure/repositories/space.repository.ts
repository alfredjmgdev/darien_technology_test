import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpaceEntity } from '../database/entities/space.entity';
import { SpaceRepositoryPort } from '../../domain/repositories/space.repository.port';
import { Space } from '../../domain/entities/space.entity';

@Injectable()
export class SpaceRepository implements SpaceRepositoryPort {
  constructor(
    @InjectRepository(SpaceEntity)
    private readonly spaceRepository: Repository<SpaceEntity>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ spaces: Space[]; total: number }> {
    try {
      const [entities, total] = await this.spaceRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        spaces: entities.map((entity) => this.mapToDomain(entity)),
        total,
      };
    } catch (error) {
      throw new Error(
        `Error finding all spaces: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findById(id: number): Promise<Space | null> {
    try {
      const entity = await this.spaceRepository.findOne({ where: { id } });
      return entity ? this.mapToDomain(entity) : null;
    } catch (error) {
      throw new Error(
        `Error finding space by ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async create(space: Partial<Space>): Promise<Space> {
    try {
      const entity = this.spaceRepository.create(space);
      const savedEntity = await this.spaceRepository.save(entity);
      return this.mapToDomain(savedEntity);
    } catch (error) {
      throw new Error(
        `Error creating space: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async update(id: number, space: Partial<Space>): Promise<Space> {
    try {
      const entityToUpdate = await this.spaceRepository.findOne({
        where: { id },
      });
      if (!entityToUpdate) {
        throw new Error(`Space with id ${id} does not exist`);
      }
      Object.assign(entityToUpdate, space);
      const updatedEntity = await this.spaceRepository.save(entityToUpdate);
      return this.mapToDomain(updatedEntity);
    } catch (error) {
      throw new Error(
        `Error updating space: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.spaceRepository.delete(id);
    } catch (error) {
      throw new Error(
        `Error deleting space: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private mapToDomain(entity: SpaceEntity): Space {
    const space = new Space();
    space.id = entity.id;
    space.name = entity.name;
    space.location = entity.location;
    space.capacity = entity.capacity;
    space.description = entity.description;
    space.createdAt = entity.createdAt;
    space.updatedAt = entity.updatedAt;
    return space;
  }
}
