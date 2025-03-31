import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";
import { API_URL } from "../config";
import { AuthContextType, User } from "../interfaces/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [error, setError] = useState<string | null>(null);

  // Update localStorage when token or user changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.statusCode === 200) {
        setToken(response.data.data.access_token);
        // Extract user info from JWT or set basic info
        setUser({ email, name: email.split("@")[0] });
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Login failed");
      } else {
        setError("An error occurred during login");
      }
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name,
      });

      if (response.data.statusCode === 201) {
        // Auto login after successful registration
        await login(email, password);
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Registration failed");
      } else {
        setError("An error occurred during registration");
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        user,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
