import axios from "axios";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

const finnhub = axios.create({
  baseURL: FINNHUB_BASE_URL,
  params: { token: API_KEY },
});

export async function fetchQuote(symbol: string) {
  try {
    const response = await finnhub.get("/quote", { params: { symbol } });
    return response.data;
  } catch (error) {
    console.error("Error fetching quote:", error);
    throw error;
  }
}

export async function fetchCompanyProfile(symbol: string) {
  try {
    const response = await finnhub.get("/stock/profile2", { params: { symbol } });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}


