import axios from "axios";

const domain = process.env.NEXT_PUBLIC_DOMAIN as string;

const axiosClient = axios.create({
  baseURL: domain + "/api",
});

export default axiosClient;
