import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { HttpStatusCode } from "axios";
import authService from "./auth.service";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
  withCredentials: true,
});

let getToken = (): string | null => null;
let onRefresh = (token: string): void => {};

export function setupInterceptors(
  tokenGetter: () => string | null,
  tokenSetter: (t: string | null) => void
) {
  getToken = tokenGetter;
  onRefresh = tokenSetter;
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === HttpStatusCode.Unauthorized &&
      !config._retry
    ) {
      config._retry = true;
      try {
        const { accessToken } = await authService.refreshToken();
        onRefresh(accessToken);
        return axiosInstance.request(config);
      } catch {
        onRefresh(null as unknown as string);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
