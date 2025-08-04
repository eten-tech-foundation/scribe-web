import appInsightsService from '@/lib/services/appInsights';

// Define proper types for Application Insights
type LogProperties = Record<string, string | number | boolean | undefined>;

type LogMeasurements = Record<string, number>;

export class Logger {
  private static appInsights = appInsightsService.getInstance();

  static setUser(userId: string, accountId?: string, userName?: string): void {
    if (!appInsightsService.isReady()) {
      console.warn(`User context would be set: ${userName ?? 'Unknown'} (${userId})`);
      return;
    }
    appInsightsService.setUser(userId, accountId, userName);
  }

  static logException(
    error: Error,
    properties?: LogProperties,
    measurements?: LogMeasurements
  ): void {
    if (!this.appInsights) {
      console.error('AppInsights not initialized:', error);
      return;
    }
    this.appInsights.trackException({
      exception: error,
      properties: {
        timestamp: new Date().toISOString(),
        ...properties,
      },
      measurements,
    });
  }

  static logEvent(name: string, properties?: LogProperties, measurements?: LogMeasurements): void {
    if (!this.appInsights) {
      console.warn(`Event: ${name}`, properties);
      return;
    }
    this.appInsights.trackEvent({
      name,
      properties: {
        timestamp: new Date().toISOString(),
        ...properties,
      },
      measurements,
    });
  }

  static logTrace(message: string, severityLevel?: number, properties?: LogProperties): void {
    if (!this.appInsights) {
      console.warn(`Trace: ${message}`, properties);
      return;
    }
    this.appInsights.trackTrace({
      message,
      severityLevel,
      properties: {
        timestamp: new Date().toISOString(),
        ...properties,
      },
    });
  }

  static logPageView(name?: string, url?: string, properties?: LogProperties): void {
    if (!this.appInsights) return;
    this.appInsights.trackPageView({
      name,
      uri: url,
      properties,
    });
  }

  static logDependency(
    name: string,
    commandName: string,
    startTime: Date,
    duration: number,
    success: boolean,
    properties?: LogProperties
  ): void {
    if (!this.appInsights) return;
    this.appInsights.trackDependencyData({
      name,
      data: commandName,
      startTime,
      duration,
      success,
      id: `${name}-${Date.now()}`,
      responseCode: success ? 200 : 500,
      properties,
    });
  }

  static logMetric(name: string, average: number, properties?: LogProperties): void {
    if (!this.appInsights) return;
    this.appInsights.trackMetric({
      name,
      average,
      properties,
    });
  }

  static info(message: string, properties?: LogProperties): void {
    this.logTrace(message, 1, properties);
  }

  static warn(message: string, properties?: LogProperties): void {
    this.logTrace(message, 2, properties);
  }

  static error(message: string, properties?: LogProperties): void {
    this.logTrace(message, 3, properties);
  }

  static critical(message: string, properties?: LogProperties): void {
    this.logTrace(message, 4, properties);
  }
}
