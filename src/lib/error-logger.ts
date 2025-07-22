const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development';

class logger {
  static log(context?: string, path?: string, componentStack?: string, ...message: any[]) {
    if (isDevelopment) {
      console.log(context ? `${context}: ${message}` : message, path, componentStack);
    }
  }

  static warn(context?: string, path?: string, componentStack?: string, ...message: any[]) {
    if (isDevelopment) {
      console.warn(context ? `${context}: ${message}` : message, path, componentStack);
    }
  }

  static info(context?: string, path?: string, componentStack?: string, ...message: any[]) {
    if (isDevelopment) {
      console.info(context ? `${context}: ${message}` : message, path, componentStack);
    }
  }

  static error(error: Error, context?: string, path?: string, componentStack?: string) {
    if (isDevelopment) {
      console.error(context ? `${context}: ${error}` : error, path, componentStack);
    }
  }
}

export default logger;
