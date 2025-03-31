import { Space } from "../types";

export interface SpaceContextType {
  spaces: Space[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  getSpaces: (page?: number) => Promise<Space[]>;
  getSpaceById: (id: number) => Promise<Space | null>;
  createSpace: (spaceData: Partial<Space>) => Promise<Space>;
  updateSpace: (id: number, spaceData: Partial<Space>) => Promise<Space>;
  deleteSpace: (id: number) => Promise<void>;
  refreshSpaces: () => Promise<void>;
  fetchSpaces: (page?: number) => Promise<void>;
}

export interface SpaceProviderProps {
  children: React.ReactNode;
}

export interface SpaceCardProps {
  space: Space;
  onUpdate: () => void;
}

export interface SpaceManagementProps {
  space: Space;
  onUpdate: () => void;
}
