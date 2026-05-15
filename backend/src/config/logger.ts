import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.resolve(__dirname, "../../logs");

// Custom log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
};

winston.addColors(colors);

const isDevelopment = process.env.NODE_ENV !== "production";

// ─── Formats ─────────────────────────────────────────────
const timestampFormat = winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" });

const jsonFormat = winston.format.combine(
    timestampFormat,
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    timestampFormat,
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
        const rid = requestId ? ` [${requestId}]` : "";
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        return `${timestamp} ${level}${rid}: ${message}${metaStr}`;
    })
);

// ─── Transports ───────────────────────────────────────────

// All logs (info+) rotating daily
const combinedRotate = new DailyRotateFile({
    dirname: LOG_DIR,
    filename: "combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    format: jsonFormat,
    level: "http",
});

// Error-only rotating file
const errorRotate = new DailyRotateFile({
    dirname: LOG_DIR,
    filename: "error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "10m",
    maxFiles: "30d",
    format: jsonFormat,
    level: "error",
});

// Performance log (custom)
const perfRotate = new DailyRotateFile({
    dirname: path.join(LOG_DIR, "perf"),
    filename: "perf-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "7d",
    format: jsonFormat,
    level: "info",
});

const consoleTransport = new winston.transports.Console({
    format: consoleFormat,
    level: isDevelopment ? "debug" : "warn",
});

// ─── Logger instances ─────────────────────────────────────

export const logger = winston.createLogger({
    level: isDevelopment ? "debug" : "http",
    levels,
    defaultMeta: { service: "pg-room-platform" },
    transports: [combinedRotate, errorRotate, consoleTransport],
    exceptionHandlers: [
        new DailyRotateFile({
            dirname: LOG_DIR,
            filename: "exceptions-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxFiles: "30d",
            format: jsonFormat,
        }),
    ],
    rejectionHandlers: [
        new DailyRotateFile({
            dirname: LOG_DIR,
            filename: "rejections-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxFiles: "30d",
            format: jsonFormat,
        }),
    ],
    exitOnError: false,
});

export const perfLogger = winston.createLogger({
    level: "info",
    levels,
    defaultMeta: { service: "pg-room-platform-perf" },
    transports: [perfRotate, consoleTransport],
    exitOnError: false,
});
