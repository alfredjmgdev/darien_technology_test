export interface Space {
  id: number;
  name: string;
  location: string;
  capacity: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reservation {
  id: number;
  spaceId: number;
  userEmail: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  message: string;
  statusCode: number;
  data: T;
  error?: string;
}
