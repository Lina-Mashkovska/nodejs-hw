import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errors as celebrateErrors } from "celebrate";

import { connectMongoDB } from "./db/connectMongoDB.js";
import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // ✅ додано

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(logger);

app.use(authRoutes);
app.use(notesRoutes);
app.use(userRoutes); 

app.use(notFoundHandler);
app.use(celebrateErrors());
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3030;

(async function bootstrap() {
  await connectMongoDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();








