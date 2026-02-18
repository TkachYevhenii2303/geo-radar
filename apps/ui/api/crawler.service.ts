import axiosInstance from "./axios.service";

const startCrawling = async (url: string): Promise<{ message: string }> => {
  return await axiosInstance.post("/crawler", { url });
};

export default {
  startCrawling,
};
