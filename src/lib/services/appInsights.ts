import { ApplicationInsights } from '@microsoft/applicationinsights-web';

import { config } from '@/lib/config';

class AppInsightsService {
  private appInsights?: ApplicationInsights;
  private isInitialized = false;

  constructor() {
    if (!config.monitoring.appInsightsConnectionString) {
      console.warn(
        'Application Insights connection string not configured - logging will fall back to console'
      );
      return;
    }

    try {
      this.appInsights = new ApplicationInsights({
        config: {
          connectionString: config.monitoring.appInsightsConnectionString,
          enableAutoRouteTracking: true,
          enableCorsCorrelation: true,
          enableRequestHeaderTracking: true,
          enableResponseHeaderTracking: true,
          enableAjaxErrorStatusText: true,
          enableUnhandledPromiseRejectionTracking: true,
          disableExceptionTracking: false,
          enablePerfMgr: true,
          excludeRequestFromAutoTrackingPatterns: [/.*\.auth0\.com.*/i, /.*auth0.*/i],
          correlationHeaderExcludedDomains: ['*.auth0.com', 'auth0.com'],
        },
      });

      this.appInsights.loadAppInsights();
      this.initialize();
      this.isInitialized = true;
    } catch {
      this.appInsights = undefined;
    }
  }

  private initialize() {
    if (!this.appInsights) return;

    this.appInsights.addTelemetryInitializer(envelope => {
      if (envelope.data?.baseData) {
        envelope.data.baseData.properties = {
          ...envelope.data.baseData.properties,
          browserSize: `${window.innerWidth}x${window.innerHeight}`,
          browserName: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          environment: config.environment.current,
        };
      }
    });

    this.appInsights.trackPageView();
  }

  setUser(userId: string, accountId?: string, userName?: string) {
    if (!this.appInsights) {
      console.warn('Cannot set user context - Application Insights not initialized');
      return;
    }

    this.appInsights.setAuthenticatedUserContext(userId, accountId);

    this.appInsights.addTelemetryInitializer(envelope => {
      if (envelope.data?.baseData) {
        envelope.data.baseData.properties = {
          ...envelope.data.baseData.properties,
          userId: userId,
          userName: userName || 'Unknown',
        };
      }
    });
  }

  getInstance() {
    return this.appInsights;
  }

  isReady() {
    return this.isInitialized && !!this.appInsights;
  }
}

const appInsightsService = new AppInsightsService();
export default appInsightsService;
