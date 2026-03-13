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
import { setupInterceptors } from "@/api/axios.service";

interface AuthContextValue {
  profile: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  token: string | null;
  updateToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const tokenRef = useRef<string | null>(null);

  const updateToken = useCallback((t: string | null) => {
    tokenRef.current = t;
    setToken(t);
  }, []);

  useEffect(() => {
    setupInterceptors(() => tokenRef.current, updateToken);
  }, [updateToken]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    authService
      .refreshToken()
      .then(({ accessToken }) => {
        updateToken(accessToken);
        return authService.getMe();
      })
      .then((me) => {
        if (mountedRef.current) setProfile(me);
      })
      .catch(() => {
        updateToken(null);
        setProfile(null);
      })
      .finally(() => {
        if (mountedRef.current) setIsLoading(false);
      });
  }, []);

  const login = useCallback(
    async (payload: LoginPayload): Promise<LoginResponse> => {
      const response = await authService.login(payload);
      updateToken(response.accessToken);
      const me = await authService.getMe();
      if (mountedRef.current) setProfile(me);
      return response;
    },
    []
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<RegisterResponse> => {
      const response = await authService.register(payload);
      updateToken(response.accessToken);
      if (mountedRef.current) {
        setProfile({
          id: response.id,
          email: response.email,
          name: response.name,
        });
      }

      return response;
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      updateToken(null);
      if (mountedRef.current) setProfile(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        profile,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        token,
        updateToken,
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
