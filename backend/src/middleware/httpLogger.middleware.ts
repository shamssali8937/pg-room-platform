import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import { logger } from "../config/logger.js";

/**
 * Stream that pipes morgan output into Winston.
 */
const morganStream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

/**
 * Custom morgan token for request ID header.
 */
morgan.token("reqId", (req: Request) => req.requestId || "-");
morgan.token("userId", (req: Request) => (req as any).user?.id || "anon");

/**
 * Production: JSON structured log format for machine parsing.
 * Development: Dev-friendly coloured tiny format.
 */
const format =
    process.env.NODE_ENV === "production"
        ? morgan(
              JSON.stringify({
                  requestId: ":reqId",
                  userId: ":userId",
                  method: ":method",
                  url: ":url",
                  status: ":status",
                  responseTime: ":response-time ms",
                  contentLength: ":res[content-length]",
                  referrer: ":referrer",
                  userAgent: ":user-agent",
              }),
              { stream: morganStream }
          )
        : morgan(
              ":method :url :status :response-time ms — [req::reqId] [user::userId]",
              { stream: morganStream }
          );

export const httpLogger = format;
