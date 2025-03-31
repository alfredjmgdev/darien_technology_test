export interface User {
  email: string;
  name: string;
}

export interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}
