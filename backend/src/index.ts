import express from "express";
import cors from "cors";
import path from "path";

import { ENV } from "./config/env";
import { clerkMiddleware } from "@clerk/express";

import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import commentRoutes from "./routes/commentRoutes";

const app = express();

app.use(cors({
  origin: ENV.NODE_ENV === "production" ? ENV.FRONTEND_URL : "*",
  credentials: true,
}));
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

if (ENV.NODE_ENV === "production") {
  // __dirname here = backend/dist/
  // frontend/dist is two levels up then into frontend/dist
  const frontendDist = path.join(__dirname, "../../frontend/dist");

  app.use(express.static(frontendDist));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.listen(process.env.PORT || 3001, () => {
  console.log("Server running");
});
