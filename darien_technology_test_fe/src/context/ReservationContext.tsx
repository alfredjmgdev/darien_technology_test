import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { API_URL } from "../config";
import { Reservation, ApiResponse } from "../types";
import {
  ReservationContextType,
  ReservationProviderProps,
} from "../interfaces/reservation";
import { PaginationData } from "../interfaces/pagination";

const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined
);

export const ReservationProvider = ({ children }: ReservationProviderProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 10,
  });
  const { token } = useAuth();

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getReservations = async (page = 1): Promise<Reservation[]> => {
    setLoading(true);
    try {
      const response = await axios.get<
        ApiResponse<{
          reservations: Reservation[];
          pagination: PaginationData;
        }>
      >(`${API_URL}/reservations?page=${page}`, authHeaders);

      const { reservations, pagination } = response.data.data;
      setReservations(reservations);
      setPagination(pagination);
      setCurrentPage(pagination.page);
      return reservations;
    } catch (error) {
      setError("Failed to fetch reservations");
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getReservationById = async (
    id: number
  ): Promise<Reservation | null> => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse<Reservation>>(
        `${API_URL}/reservations/${id}`,
        authHeaders
      );
      return response.data.data;
    } catch (error) {
      setError("Failed to fetch reservation details");
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (
    reservationData: Partial<Reservation>
  ): Promise<Reservation> => {
    setLoading(true);
    try {
      const response = await axios.post<ApiResponse<Reservation>>(
        `${API_URL}/reservations`,
        reservationData,
        authHeaders
      );
      const newReservation = response.data.data;
      setReservations([...reservations, newReservation]);
      return newReservation;
    } catch (error) {
      setError("Failed to create reservation");
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateReservation = async (
    id: number,
    reservationData: Partial<Reservation>
  ): Promise<Reservation> => {
    setLoading(true);
    try {
      const response = await axios.put<ApiResponse<Reservation>>(
        `${API_URL}/reservations/${id}`,
        reservationData,
        authHeaders
      );
      const updatedReservation = response.data.data;
      setReservations(
        reservations.map((reservation) =>
          reservation.id === id ? updatedReservation : reservation
        )
      );
      return updatedReservation;
    } catch (error) {
      setError("Failed to update reservation");
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteReservation = async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/reservations/${id}`, authHeaders);
      setReservations(
        reservations.filter((reservation) => reservation.id !== id)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const refreshReservations = async (): Promise<void> => {
    await getReservations();
  };

  const fetchReservations = async (page = 1) => {
    setCurrentPage(page);
    const fetchedReservations = await getReservations(page);
    setReservations(fetchedReservations);
  };

  useEffect(() => {
    if (token) {
      refreshReservations();
    }
  }, [token]);

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        loading,
        error,
        currentPage,
        pagination,
        getReservations,
        getReservationById,
        createReservation,
        updateReservation,
        deleteReservation,
        refreshReservations,
        fetchReservations,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error("useReservation must be used within a ReservationProvider");
  }
  return context;
};
