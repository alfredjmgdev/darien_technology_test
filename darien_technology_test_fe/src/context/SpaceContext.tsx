import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { API_URL } from "../config";
import { Space, ApiResponse } from "../types";
import { SpaceContextType, SpaceProviderProps } from "../interfaces/space";

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const SpaceProvider = ({ children }: SpaceProviderProps) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { token } = useAuth();

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getSpaces = useCallback(
    async (page = 1): Promise<Space[]> => {
      setLoading(true);
      try {
        const response = await axios.get<ApiResponse<{ spaces: Space[] }>>(
          `${API_URL}/spaces?page=${page}`,
          authHeaders
        );
        const fetchedSpaces = response.data.data.spaces;
        setSpaces(fetchedSpaces);
        return fetchedSpaces;
      } catch (error) {
        setError("Failed to fetch spaces");
        console.error(error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const getSpaceById = useCallback(
    async (id: number): Promise<Space | null> => {
      setLoading(true);
      try {
        const response = await axios.get<ApiResponse<Space>>(
          `${API_URL}/spaces/${id}`,
          authHeaders
        );
        return response.data.data;
      } catch (error) {
        setError("Failed to fetch space details");
        console.error(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const createSpace = useCallback(
    async (spaceData: Partial<Space>): Promise<Space> => {
      setLoading(true);
      try {
        const response = await axios.post<ApiResponse<Space>>(
          `${API_URL}/spaces`,
          spaceData,
          authHeaders
        );
        const newSpace = response.data.data;
        setSpaces([...spaces, newSpace]);
        return newSpace;
      } catch (error) {
        setError("Failed to create space");
        console.error(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [token, spaces]
  );

  const updateSpace = useCallback(
    async (id: number, spaceData: Partial<Space>): Promise<Space> => {
      setLoading(true);
      try {
        await axios.put(`${API_URL}/spaces/${id}`, spaceData, authHeaders);
        const updatedSpace = await getSpaceById(id);
        if (updatedSpace) {
          setSpaces(
            spaces.map((space) => (space.id === id ? updatedSpace : space))
          );
          return updatedSpace;
        }
        throw new Error("Failed to retrieve updated space");
      } catch (error) {
        setError("Failed to update space");
        console.error(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [token, spaces, getSpaceById]
  );

  const deleteSpace = useCallback(
    async (id: number): Promise<void> => {
      try {
        await axios.delete(`${API_URL}/spaces/${id}`, authHeaders);
        setSpaces(spaces.filter((space) => space.id !== id));
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    [token, spaces]
  );

  const refreshSpaces = useCallback(async (): Promise<void> => {
    await getSpaces();
  }, [getSpaces]);

  const fetchSpaces = useCallback(
    async (page = 1) => {
      setCurrentPage(page);
      const fetchedSpaces = await getSpaces(page);
      setSpaces(fetchedSpaces);
    },
    [getSpaces]
  );

  useEffect(() => {
    if (token) {
      refreshSpaces();
    }
  }, [token]);

  return (
    <SpaceContext.Provider
      value={{
        spaces,
        loading,
        error,
        currentPage,
        getSpaces,
        getSpaceById,
        createSpace,
        updateSpace,
        deleteSpace,
        refreshSpaces,
        fetchSpaces,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpace = () => {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error("useSpace must be used within a SpaceProvider");
  }
  return context;
};
