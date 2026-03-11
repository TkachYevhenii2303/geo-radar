import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { HttpStatusCode } from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("authToken")
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    // Do NOT redirect here — AuthContext owns auth state and redirect logic.
    // Redirecting in an interceptor causes race conditions with context cleanup
    // and infinite loops on auth pages.
    if (error.response?.status === HttpStatusCode.Unauthorized) {
      // Clear stale tokens so subsequent requests don't resend them
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
      }
      if (typeof document !== "undefined") {
        document.cookie = "authToken=; path=/; max-age=0";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
