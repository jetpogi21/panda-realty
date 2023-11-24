import { AppConfig } from "@/lib/app-config";
import axios from "axios";

const domain = process.env.NEXT_PUBLIC_DOMAIN as string;
const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

const axiosClient = axios.create({
  baseURL: domain + "/api",
});

export const axiosServerClient = axios.create({
  baseURL: `${supabaseURL}/rest/v1`,
  headers: {
    apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "Accept-Profile": AppConfig.sanitizedAppName,
  },
});

export default axiosClient;
