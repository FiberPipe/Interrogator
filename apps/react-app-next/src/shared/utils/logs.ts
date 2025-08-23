type LogLevel = "info" | "error" | "warn" | "debug";

const log = (level: LogLevel, message: string, meta?: unknown) => {
  const formattedMessage =
    typeof meta !== "undefined"
      ? `${message} | meta: ${JSON.stringify(meta)}`
      : message;

  window.logger?.[level](formattedMessage);
};

export const logInfo = (msg: string, meta?: unknown) =>
  log("info", msg, meta);

export const logError = (msg: string, meta?: unknown) =>
  log("error", msg, meta);

export const logWarn = (msg: string, meta?: unknown) =>
  log("warn", msg, meta);

export const logDebug = (msg: string, meta?: unknown) =>
  log("debug", msg, meta);