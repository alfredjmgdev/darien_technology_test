import { Reservation } from "../types";
import { PaginationData } from "./pagination";

export interface ReservationContextType {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pagination: PaginationData;
  getReservations: (page?: number) => Promise<Reservation[]>;
  getReservationById: (id: number) => Promise<Reservation | null>;
  createReservation: (
    reservationData: Partial<Reservation>
  ) => Promise<Reservation>;
  updateReservation: (
    id: number,
    reservationData: Partial<Reservation>
  ) => Promise<Reservation>;
  deleteReservation: (id: number) => Promise<void>;
  refreshReservations: () => Promise<void>;
  fetchReservations: (page?: number) => Promise<void>;
}

export interface ReservationProviderProps {
  children: React.ReactNode;
}

export interface ReservationCardProps {
  reservation: Reservation;
  spaceName: string;
  onUpdate: () => void;
}
