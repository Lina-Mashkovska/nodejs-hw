import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { errors as celebrateErrors } from "celebrate";

import { connectMongoDB } from "./db/connectMongoDB.js";
import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import notesRoutes from "./routes/notesRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);


app.use(notesRoutes);
app.use(notFoundHandler);
app.use(celebrateErrors());
app.use(errorHandler);


const PORT = Number(process.env.PORT) || 3030;

(async function bootstrap() {
  try {
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();





