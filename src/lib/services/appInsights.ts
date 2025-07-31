import { ApplicationInsights } from '@microsoft/applicationinsights-web';

import { config } from '@/lib/config';

import type { ITelemetryItem } from '@microsoft/applicationinsights-web';

interface TelemetryEnvelope {
  data?: {
    baseData?: {
      properties?: Record<string, string | number | boolean>;
    };
  };
}

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
      console.warn('✅ Application Insights initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Application Insights:', error);
      this.appInsights = undefined;
    }
  }

  private initialize(): void {
    if (!this.appInsights) return;

    this.appInsights.addTelemetryInitializer((envelope: ITelemetryItem): boolean => {
      const typedEnvelope = envelope as unknown as TelemetryEnvelope;
      if (typedEnvelope.data?.baseData) {
        const currentProperties = typedEnvelope.data.baseData.properties ?? {};
        typedEnvelope.data.baseData.properties = {
          ...currentProperties,
          browserSize: `${window.innerWidth}x${window.innerHeight}`,
          browserName: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          environment: config.environment.current,
        };
      }
      return true;
    });

    this.appInsights.trackPageView();
  }

  setUser(userId: string, accountId?: string, userName?: string): void {
    if (!this.appInsights) {
      console.warn('Cannot set user context - Application Insights not initialized');
      return;
    }

    this.appInsights.setAuthenticatedUserContext(userId, accountId);

    this.appInsights.addTelemetryInitializer((envelope: ITelemetryItem): boolean => {
      const typedEnvelope = envelope as unknown as TelemetryEnvelope;
      if (typedEnvelope.data?.baseData) {
        const currentProperties = typedEnvelope.data.baseData.properties ?? {};
        typedEnvelope.data.baseData.properties = {
          ...currentProperties,
          userId: userId,
          userName: userName ?? 'Unknown',
        };
      }
      return true;
    });
  }

  getInstance(): ApplicationInsights | undefined {
    return this.appInsights;
  }

  isReady(): boolean {
    return this.isInitialized && !!this.appInsights;
  }
}

const appInsightsService = new AppInsightsService();
export default appInsightsService;
