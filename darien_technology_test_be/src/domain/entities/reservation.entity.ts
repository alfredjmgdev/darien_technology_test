export class Reservation {
  id: number;
  spaceId: number;
  userEmail: string;
  reservationDate: Date;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt?: Date;
}
