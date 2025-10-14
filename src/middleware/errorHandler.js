export const errorHandler = (err, req, res, _next) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    if (req.log?.error) req.log.error({ err }, "Unhandled error");
    res.status(status).json({ message });
  };
  