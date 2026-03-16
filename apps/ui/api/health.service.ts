import axiosInstance from "./axios.service";

const getLiveness = async (): Promise<{
  type: string;
  status: string;
  message: string;
}> => {
  const response: any = await axiosInstance.get("/health/liveness");
  return {
    type: "liveness",
    status: response?.info?.["HttpHealthIndicator"]?.status,
    message: response?.info?.["HttpHealthIndicator"]?.message,
  };
};

const getReadiness = async (): Promise<{
  type: string;
  status: string;
  message: string;
}> => {
  const response: any = await axiosInstance.get("/health/readiness");
  return {
    type: "readiness",
    status: response?.info?.["postgres"]?.status,
    message: response.status === "ok" ? "Database is ok" : "Database is not ok",
  };
};

const getHttp = async (): Promise<{
  type: string;
  status: string;
  message: string;
}> => {
  const response: any = await axiosInstance.get("/health/http");
  return {
    type: "http",
    status: response?.info?.["HttpHealthIndicator"]?.status,
    message: response?.info?.["HttpHealthIndicator"]?.message,
  };
};

export default {
  getLiveness,
  getReadiness,
  getHttp,
};
