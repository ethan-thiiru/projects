import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const ENV = {
  PORT: parseInt(process.env.PORT || "3001", 10), // Fixes 503 by ensuring correct port binding
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV || "development", // Fallback for safety
  FRONTEND_URL: process.env.FRONTEND_URL,
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
};
