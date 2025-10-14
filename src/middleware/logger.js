import pinoHttp from "pino-http";

export const logger = pinoHttp({
  genReqId: (req) =>
    req.id ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { singleLine: true, translateTime: "SYS:standard" } }
      : undefined,
});
