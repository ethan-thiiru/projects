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
app.use(clerkMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/comments", commentRoutes);

if (ENV.NODE_ENV === "production") {
  // Use process.cwd() to get the root directory where 'npm start' was called
  const rootDir = process.cwd();
  const frontendDistPath = path.join(rootDir, "frontend", "dist");

  app.use(express.static(frontendDistPath));

  // Correct catch-all for React SPA
  app.get("*", (req, res) => {
    // Check if it's an API route first; if not, send index.html
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API route not found" });
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Bind to 0.0.0.0 for cloud environments
app.listen(ENV.PORT, "0.0.0.0", () => {
  console.log(`Server is running on PORT: ${ENV.PORT}`);
});