import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, register } =
    useAuthContext();

  return { user, isAuthenticated, isLoading, login, logout, register };
}
