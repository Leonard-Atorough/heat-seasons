export interface LogEntry {
  message: string;
  timestamp: string;
  level: string;
}

/**
 * A simple in-memory logger that supports different log levels (INFO, WARNING, ERROR).
 * Logs are stored in memory and can be retrieved or flushed to a file.
 */
// NOTE: To be replaced with Morgan or Winston in the future for more advanced logging capabilities.
export class Logger {
  private inMemoryLogs: LogEntry[] = [];
  constructor() {}

  private log(message: string, level: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.inMemoryLogs.push({ message, timestamp, level });
  }

  logInfo(message: string) {
    this.log(`${message}`, "INFO");
    console.log(this.inMemoryLogs[this.inMemoryLogs.length - 1]);
  }

  logWarning(message: string) {
    this.log(`${message}`, "WARNING");
    console.warn(this.inMemoryLogs[this.inMemoryLogs.length - 1]);
  }

  logError(message: string) {
    this.log(`${message}`, "ERROR");
    console.error(this.inMemoryLogs[this.inMemoryLogs.length - 1]);
  }

  getLogs(levelFilter?: string): string[] {
    if (levelFilter) {
      return this.inMemoryLogs
        .filter((log) => log.level === levelFilter)
        .map((log) => `[${log.timestamp}] ${log.message}`);
    }
    return this.inMemoryLogs.map((log) => `[${log.timestamp}] ${log.message}`);
  }

  clearLogs(): void {
    this.inMemoryLogs = [];
  }

  flushLogsToFile(filePath: string): void {
    const fs = require("fs");
    const logData = this.inMemoryLogs.map((log) => `[${log.timestamp}] ${log.message}`).join("\n");
    fs.writeFileSync(filePath, logData, "utf-8");
    this.clearLogs();
  }
}

export default new Logger();
