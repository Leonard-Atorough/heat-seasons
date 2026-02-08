import { createContext } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  role: "admin" | "user";
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
