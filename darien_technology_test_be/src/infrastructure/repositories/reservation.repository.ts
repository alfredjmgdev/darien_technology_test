import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { ReservationEntity } from '../database/entities/reservation.entity';
import { ReservationRepositoryPort } from '../../domain/repositories/reservation.repository.port';
import { Reservation } from '../../domain/entities/reservation.entity';

@Injectable()
export class ReservationRepository implements ReservationRepositoryPort {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly reservationRepository: Repository<ReservationEntity>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ reservations: Reservation[]; total: number }> {
    try {
      const [entities, total] = await this.reservationRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        relations: ['space'],
      });

      return {
        reservations: entities.map((entity) => this.mapToDomain(entity)),
        total,
      };
    } catch (error) {
      throw new Error(
        `Error finding all reservations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findAllWithoutPagination(
    conditions: FindOptionsWhere<Reservation>,
    select: string[] = [],
    relations: string[] = [],
  ): Promise<Reservation[] | null> {
    try {
      const selected: FindOptionsSelect<Reservation> = select.reduce(
        (acc, field) => {
          acc[field as keyof Reservation] = true;
          return acc;
        },
        {} as FindOptionsSelect<Reservation>,
      );

      return await this.reservationRepository.find({
        where: conditions,
        select: selected,
        relations,
      });
    } catch (error) {
      console.log(`[${this.constructor.name}] - END: error`, error);
      throw error;
    }
  }

  async findById(id: number): Promise<Reservation | null> {
    try {
      const entity = await this.reservationRepository.findOne({
        where: { id },
        relations: ['space'],
      });
      return entity ? this.mapToDomain(entity) : null;
    } catch (error) {
      throw new Error(
        `Error finding reservation by ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findByUserEmail(
    email: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Reservation[]> {
    try {
      const entities = await this.reservationRepository.find({
        where: {
          userEmail: email,
          reservationDate: Between(startDate, endDate),
        },
        relations: ['space'],
      });

      return entities.map((entity) => this.mapToDomain(entity));
    } catch (error) {
      throw new Error(
        `Error finding reservations by user email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findBySpaceAndTimeRange(
    spaceId: number,
    startTime: Date,
    endTime: Date,
  ): Promise<Reservation[]> {
    try {
      // Buscar reservas que se superpongan con el rango de tiempo dado
      const entities = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.spaceId = :spaceId', { spaceId })
        .andWhere(
          '(reservation.startTime < :endTime AND reservation.endTime > :startTime)',
          { startTime, endTime },
        )
        .getMany();

      return entities.map((entity) => this.mapToDomain(entity));
    } catch (error) {
      throw new Error(
        `Error finding reservations by space and time range: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async create(reservation: Partial<Reservation>): Promise<Reservation> {
    try {
      const entity = this.reservationRepository.create(reservation);
      const savedEntity = await this.reservationRepository.save(entity);
      return this.mapToDomain(savedEntity);
    } catch (error) {
      throw new Error(
        `Error creating reservation: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async update(
    id: number,
    reservation: Partial<Reservation>,
  ): Promise<Reservation> {
    try {
      const entityToUpdate = await this.reservationRepository.findOne({
        where: { id },
      });
      if (!entityToUpdate) {
        throw new Error(`Space with id ${id} does not exist`);
      }
      Object.assign(entityToUpdate, reservation);
      const updatedEntity =
        await this.reservationRepository.save(entityToUpdate);
      return this.mapToDomain(updatedEntity);
    } catch (error) {
      throw new Error(
        `Error updating reservation: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.reservationRepository.delete(id);
    } catch (error) {
      throw new Error(
        `Error deleting reservation: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private mapToDomain(entity: ReservationEntity): Reservation {
    const reservation = new Reservation();
    reservation.id = entity.id;
    reservation.spaceId = entity.spaceId;
    reservation.userEmail = entity.userEmail;
    reservation.reservationDate = entity.reservationDate;
    reservation.startTime = entity.startTime;
    reservation.endTime = entity.endTime;
    reservation.createdAt = entity.createdAt;
    reservation.updatedAt = entity.updatedAt;
    return reservation;
  }
}
