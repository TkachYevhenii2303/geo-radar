"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import authService from "@/api/auth.service";
import {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from "@/types/auth.types";

const AUTH_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .getMe()
      .then((me) => {
        if (mountedRef.current) setUser(me);
      })
      .catch(() => {
        // Token is invalid — clear everything; redirect is handled by the
        // protected layout's auth check, not here.
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`;
      })
      .finally(() => {
        if (mountedRef.current) setIsLoading(false);
      });
  }, []);

  const storeTokens = (
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ) => {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    document.cookie = `${AUTH_TOKEN_KEY}=${accessToken}; path=/; max-age=${expiresIn}; SameSite=Lax`;
  };

  const clearTokens = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`;
  };

  const login = useCallback(
    async (payload: LoginPayload): Promise<LoginResponse> => {
      const response = await authService.login(payload);
      storeTokens(
        response.accessToken,
        response.refreshToken,
        response.expiresIn
      );
      const me = await authService.getMe();
      if (mountedRef.current) setUser(me);
      return response;
    },
    []
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<RegisterResponse> => {
      const response = await authService.register(payload);
      storeTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken,
        response.tokens.expiresIn
      );
      if (mountedRef.current) {
        setUser({ id: response.id, email: response.email, name: response.name });
      }
      return response;
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      clearTokens();
      if (mountedRef.current) setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
