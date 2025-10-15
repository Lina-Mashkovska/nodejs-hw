// src/middleware/errorHandler.js
import { isHttpError } from "http-errors";

export const errorHandler = (err, req, res, _next) => {
  if (isHttpError(err)) {
    const status = err.status ?? err.statusCode ?? 500;
    if (req.log?.error) req.log.error({ err }, "HttpError");
    return res.status(status).json({ message: err.message });
  }

  if (req.log?.error) req.log.error({ err }, "Unhandled error");
  return res.status(500).json({ message: "Internal Server Error" });
};

  