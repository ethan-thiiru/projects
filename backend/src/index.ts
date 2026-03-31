import express from "express";
import cors from "cors";
import path from "path";

import { ENV } from "./config/env";
import { clerkMiddleware } from "@clerk/express";

import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import commentRoutes from "./routes/commentRoutes";

const app = express();

app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }));
// `credentials: true` allows the frontend to send cookies to the backend so that we can authenticate the user.
app.use(clerkMiddleware()); // auth obj will be attached to the req
app.use(express.json()); // parses JSON request bodies.
app.use(express.urlencoded({ extended: true })); // parses form data (like HTML forms).

app.get("/api/health", (req, res) => {
  res.json({
    message: "Welcome to Productify API - Powered by PostgreSQL, Drizzle ORM & Clerk Auth",
    endpoints: {
      users: "/api/users",
      products: "/api/products",
      comments: "/api/comments",
    },
  });
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/comments", commentRoutes);

// 1. Find the "if (ENV.NODE_ENV === 'production')" block and replace it:
if (ENV.NODE_ENV === "production") {
  const rootDir = process.cwd(); // Points to /app (the root of your project)
  const frontendDistPath = path.join(rootDir, "frontend", "dist");

  app.use(express.static(frontendDistPath));

  // Correct wildcard syntax and API protection
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API Route not found" });
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// 2. Change the app.listen line at the bottom:
app.listen(ENV.PORT, "0.0.0.0", () => {
  console.log(`Server is running on PORT: ${ENV.PORT} ✅`);
});
