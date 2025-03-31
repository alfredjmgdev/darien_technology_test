import { Space } from 'src/domain/entities/space.entity';

export interface GetSpacesResponse {
  spaces: Space[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}
