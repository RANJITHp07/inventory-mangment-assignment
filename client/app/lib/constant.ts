export const BACKEND_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://inventory-mangment-assignment-2.onrender.com"
    : "http://localhost:3000";