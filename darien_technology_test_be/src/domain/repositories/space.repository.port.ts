import { Space } from '../entities/space.entity';

export interface SpaceRepositoryPort {
  findAll(
    page: number,
    limit: number,
  ): Promise<{ spaces: Space[]; total: number }>;
  findById(id: number): Promise<Space | null>;
  create(space: Partial<Space>): Promise<Space>;
  update(id: number, space: Partial<Space>): Promise<Space>;
  delete(id: number): Promise<void>;
}
