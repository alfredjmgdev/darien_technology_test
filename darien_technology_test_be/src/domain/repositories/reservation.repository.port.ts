import { FindOptionsWhere } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';

export interface ReservationRepositoryPort {
  findAll(
    page: number,
    limit: number,
  ): Promise<{ reservations: Reservation[]; total: number }>;
  findAllWithoutPagination(
    conditions: FindOptionsWhere<Reservation>,
    select: string[],
    relations: string[],
  ): Promise<Reservation[] | null>;
  findById(id: number): Promise<Reservation | null>;
  findByUserEmail(
    email: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Reservation[]>;
  findBySpaceAndTimeRange(
    spaceId: number,
    startTime: Date,
    endTime: Date,
  ): Promise<Reservation[]>;
  create(reservation: Partial<Reservation>): Promise<Reservation>;
  update(id: number, reservation: Partial<Reservation>): Promise<Reservation>;
  delete(id: number): Promise<void>;
}
