import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: number): Promise<User | null> {
    try {
      const entity = await this.userRepository.findOne({ where: { id } });
      return entity ? this.mapToDomain(entity) : null;
    } catch (error) {
      throw new Error(
        `Error finding user by ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const entity = await this.userRepository.findOne({ where: { email } });
      return entity ? this.mapToDomain(entity) : null;
    } catch (error) {
      throw new Error(
        `Error finding user by email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async create(user: Partial<User>): Promise<User> {
    try {
      const entity = this.userRepository.create(user);
      const savedEntity = await this.userRepository.save(entity);
      return this.mapToDomain(savedEntity);
    } catch (error) {
      throw new Error(
        `Error creating user: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    try {
      const entityToUpdate = await this.userRepository.findOne({
        where: { id },
      });
      if (!entityToUpdate) {
        throw new Error(`User with id ${id} does not exist`);
      }

      Object.assign(entityToUpdate, user);
      const updatedEntity = await this.userRepository.save(entityToUpdate);

      return this.mapToDomain(updatedEntity);
    } catch (error) {
      throw new Error(
        `Error updating user: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.userRepository.delete(id);
    } catch (error) {
      throw new Error(
        `Error deleting user: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private mapToDomain(entity: UserEntity): User {
    const user = new User();
    user.id = entity.id;
    user.email = entity.email;
    user.password = entity.password;
    user.name = entity.name;
    user.createdAt = entity.createdAt;
    user.updatedAt = entity.updatedAt;
    return user;
  }
}
