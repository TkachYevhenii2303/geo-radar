import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { profile, isAuthenticated, isLoading, login, logout, register } =
    useAuthContext();

  return { profile, isAuthenticated, isLoading, login, logout, register };
}
