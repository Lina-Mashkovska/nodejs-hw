import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use(
  pinoHttp({

    genReqId: (req) => req.id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  })
);

app.get("/notes", (_req, res) => {
  res.status(200).json({ message: "Retrieved all notes" });
});

app.get("/notes/:noteId", (req, res) => {
  const { noteId } = req.params;
  res.status(200).json({ message: `Retrieved note with ID: ${noteId}` });
});


app.get("/test-error", () => {
  throw new Error("Simulated server error");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


app.use((err, req, res, _next) => {

  if (req.log && typeof req.log.error === "function") {
    req.log.error({ err }, "Unhandled error");
  } else {

    console.error(err);
  }
  res.status(500).json({ message: err.message || "Internal Server Error" });
});



const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);
});
