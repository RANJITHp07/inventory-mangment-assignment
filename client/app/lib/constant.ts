export const BACKEND_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://inventory-mangment-assignment-mx8l.vercel.app"
    : "http://localhost:3000";