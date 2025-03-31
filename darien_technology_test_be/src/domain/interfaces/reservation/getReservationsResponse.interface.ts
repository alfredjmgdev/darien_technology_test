import { Reservation } from 'src/domain/entities/reservation.entity';

export interface GetReservationsResponse {
  reservations: Reservation[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}
