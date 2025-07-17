import appInsightsService from '@/lib/services/appInsights';

export class Logger {
  private static appInsights = appInsightsService.getInstance();
  static setUser(userId: string, accountId?: string, userName?: string) {
    if (!appInsightsService.isReady()) {
      return;
    }
    appInsightsService.setUser(userId, accountId, userName);
  }

  static logException(
    error: Error,
    properties?: Record<string, any>,
    measurements?: Record<string, number>
  ) {
    if (!this.appInsights) {
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

  static logEvent(
    name: string,
    properties?: Record<string, any>,
    measurements?: Record<string, number>
  ) {
    if (!this.appInsights) {
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

  static logTrace(message: string, severityLevel?: number, properties?: Record<string, any>) {
    if (!this.appInsights) {
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

  static logPageView(name?: string, url?: string, properties?: Record<string, any>) {
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
    properties?: Record<string, any>
  ) {
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

  static logMetric(name: string, average: number, properties?: Record<string, any>) {
    if (!this.appInsights) return;
    this.appInsights.trackMetric({
      name,
      average,
      properties,
    });
  }
  static info(message: string, properties?: Record<string, any>) {
    this.logTrace(message, 1, properties);
  }

  static warn(message: string, properties?: Record<string, any>) {
    this.logTrace(message, 2, properties);
  }

  static error(message: string, properties?: Record<string, any>) {
    this.logTrace(message, 3, properties);
  }

  static critical(message: string, properties?: Record<string, any>) {
    this.logTrace(message, 4, properties);
  }
}
