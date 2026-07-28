import { window } from "vscode";
import {
  createLogger,
  format,
  Logger as WLogger
} from "winston";
import { LogOutputChannelTransport } from "winston-transport-vscode";

class Logger {
  private static instance: Logger | undefined;
  private wlog: WLogger;

  private constructor() {
    const outputChannel = window.createOutputChannel("RISCV extension", {
      log: true
    });

    const transport = new LogOutputChannelTransport({ outputChannel });

    this.wlog = createLogger({
      level: "trace", // Recommended: set the highest possible level
      levels: LogOutputChannelTransport.config.levels, // Recommended: use predefined VS Code log levels
      // format: LogOutputChannelTransport.format(), // Recommended: use predefined format
      format: format.json(),
      transports: [transport]
    });

    // this.wlog = createLogger({
    //   level: "trace",
    //   levels: LogOutputChannelTransport.config.levels,
    //   format: format.json(),
    //   transports: [
    //     // new transports.File({filename: 'xxxxlog.json',level: 'trace'})
    //     //new transports.Console()
    //   ]
    // });
  }

  public static getLogger() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public static getWLogger() {
    return Logger.getLogger().wlog;
  }

  public static log(level: string, message: string, ...meta: any[]) {
    return this.getLogger().wlog.log(level, message, meta);
  }
}

export function logger() {
  return Logger.getWLogger();
}

export function log(level: string, message: string, ...meta: any[]) {
  Logger.log(level, message, meta);
}
