export class Logger {
  private static instance: Logger;
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  info(message: string, ...args: any[]): void {
    console.error(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  }
  
  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  }
  
  warn(message: string, ...args: any[]): void {
    console.error(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  }
  
  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
}

export const logger = Logger.getInstance();