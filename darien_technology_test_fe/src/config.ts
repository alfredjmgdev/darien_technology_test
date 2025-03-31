export const ENV = import.meta.env.VITE_ENV || "local";
export const API_URL: string =
  ENV === "local" ? "http://localhost:3001" : import.meta.env.VITE_API_URL;
