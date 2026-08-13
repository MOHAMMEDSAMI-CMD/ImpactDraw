import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const getWallet = async () => {
  const response = await axios.get(
    `${API_URL}/api/wallet`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const getTransactions = async () => {
  const response = await axios.get(
    `${API_URL}/api/wallet/transactions`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};