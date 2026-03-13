import axiosInstance from "./axios.service";
import {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  AuthUser,
} from "@/types/auth.types";

const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  return axiosInstance.post("/auth/login", payload);
};

const register = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  return axiosInstance.post("/auth/register", payload);
};

const refreshToken = async (): Promise<{ accessToken: string }> => {
  return axiosInstance.post("/auth/refresh-token");
};

const logout = async (): Promise<void> => {
  return axiosInstance.post("/auth/logout");
};

const getMe = async (): Promise<AuthUser> => {
  return axiosInstance.get("/auth/me");
};

export default {
  login,
  register,
  refreshToken,
  logout,
  getMe,
};
