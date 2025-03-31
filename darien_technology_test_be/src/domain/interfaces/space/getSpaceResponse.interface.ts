export interface GetSpaceResponse {
  id: number;
  name: string;
  location: string;
  capacity: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
