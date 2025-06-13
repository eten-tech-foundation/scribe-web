import React, { useState } from 'react';

import appInsightsService from '@/lib/services/appInsights';
import { Logger } from '@/lib/services/logger';

export const AppInsightsTestPage: React.FC = () => {
  const [userSet, setUserSet] = useState(false);
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)]);
  };
  const isAppInsightsReady = appInsightsService.isReady();

  const testLogEvent = () => {
    Logger.logEvent('TestButtonClicked', {
      buttonType: 'event-test',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
    addResult('✅ Event logged: TestButtonClicked');
  };
  const testLogException = () => {
    const testError = new Error('This is a test exception for Application Insights');
    Logger.logException(testError, {
      testType: 'manual-exception',
      component: 'AppInsightsTestPage',
    });
    addResult('✅ Exception logged: Test exception');
  };

  const testLogTrace = (level: 'info' | 'warn' | 'error' | 'critical') => {
    const messages = {
      info: 'This is an info trace message',
      warn: 'This is a warning trace message',
      error: 'This is an error trace message',
      critical: 'This is a critical trace message',
    };

    Logger[level](messages[level], {
      testType: 'trace-test',
      severityLevel: level,
    });
    addResult(`✅ ${level.toUpperCase()} trace logged`);
  };
  const testLogPageView = () => {
    Logger.logPageView('AppInsights Test Page', '/app-insights-test', {
      testType: 'page-view-test',
      userAgent: navigator.userAgent,
    });
    addResult('✅ Page view logged');
  };
  const testLogDependency = async () => {
    const startTime = new Date();
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    const duration = new Date().getTime() - startTime.getTime();
    const success = Math.random() > 0.3;

    Logger.logDependency('Test API Call', 'GET /api/test-endpoint', startTime, duration, success, {
      testType: 'dependency-test',
      endpoint: '/api/test-endpoint',
      method: 'GET',
    });

    addResult(`✅ Dependency logged: ${success ? 'Success' : 'Failed'} (${duration}ms)`);
  };
  const testLogMetric = () => {
    const randomValue = Math.random() * 100;
    Logger.logMetric('TestMetric', randomValue, {
      testType: 'metric-test',
      unit: 'percentage',
    });
    addResult(`✅ Metric logged: ${randomValue.toFixed(2)}`);
  };

  const testSetUser = () => {
    const testUserId = `test-user-${Date.now()}`;
    const testUserName = 'Test User';
    const testAccountId = `account-${Date.now()}`;

    Logger.setUser(testUserId, testAccountId, testUserName);
    setUserSet(true);
    addResult(`✅ User context set: ${testUserName} (${testUserId})`);
  };

  const testErrorBoundary = () => {
    setShouldThrowError(true);
  };
  const testGlobalError = () => {
    setTimeout(() => {
      throw new Error('This is a test global error for Application Insights');
    }, 100);
    addResult('✅ Global error thrown (check console/AppInsights)');
  };
  const testUnhandledPromiseRejection = () => {
    Promise.reject(new Error('This is a test unhandled promise rejection'));
    addResult('✅ Unhandled promise rejection triggered');
  };

  if (shouldThrowError) {
    throw new Error('This is a test error to trigger the Error Boundary');
  }

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-6'>
      <div className='text-center'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>Application Insights Test Page</h1>
        <p className='text-gray-600'>
          Test all logging features and check Azure Application Insights for results
        </p>
      </div>

      {/* Application Insights Status */}
      <div
        className={`rounded-lg border p-4 ${
          isAppInsightsReady ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
        }`}
      >
        <h2
          className={`mb-2 text-xl font-semibold ${
            isAppInsightsReady ? 'text-green-800' : 'text-orange-800'
          }`}
        >
          Application Insights Status
        </h2>
        <div className='flex items-center space-x-2'>
          <div
            className={`h-3 w-3 rounded-full ${
              isAppInsightsReady ? 'bg-green-500' : 'bg-orange-500'
            }`}
          ></div>
          <span
            className={`font-medium ${isAppInsightsReady ? 'text-green-700' : 'text-orange-700'}`}
          >
            {isAppInsightsReady
              ? '✅ Connected to Azure Application Insights'
              : '⚠️ Not connected - logs will go to console only'}
          </span>
        </div>
        {!isAppInsightsReady && (
          <p className='mt-2 text-sm text-orange-600'>
            To enable Application Insights, set{' '}
            <code className='rounded bg-orange-100 px-1'>VITE_APP_INSIGHTS_CONNECTION_STRING</code>{' '}
            in your .env file
          </p>
        )}
      </div>

      {/* User Context Section */}
      <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
        <h2 className='mb-3 text-xl font-semibold text-blue-800'>User Context</h2>
        <div className='flex items-center space-x-4'>
          <button
            className={`rounded px-4 py-2 font-medium ${
              userSet
                ? 'border border-green-300 bg-green-100 text-green-800'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={userSet}
            onClick={testSetUser}
          >
            {userSet ? '✅ User Context Set' : 'Set Test User Context'}
          </button>
          {userSet && (
            <span className='text-sm text-green-600'>
              All subsequent logs will include user info
            </span>
          )}
        </div>
      </div>

      {/* Basic Logging Tests */}
      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
        <h2 className='mb-3 text-xl font-semibold text-gray-800'>Basic Logging</h2>
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          <button
            className='rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700'
            onClick={testLogEvent}
          >
            Log Event
          </button>
          <button
            className='rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700'
            onClick={testLogException}
          >
            Log Exception
          </button>
          <button
            className='rounded bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700'
            onClick={testLogPageView}
          >
            Log Page View
          </button>
          <button
            className='rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700'
            onClick={testLogMetric}
          >
            Log Metric
          </button>
        </div>
      </div>

      {/* Trace Logging Tests */}
      <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
        <h2 className='mb-3 text-xl font-semibold text-yellow-800'>
          Trace Logging (Different Severity Levels)
        </h2>
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          <button
            className='rounded bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600'
            onClick={() => testLogTrace('info')}
          >
            Info Trace
          </button>
          <button
            className='rounded bg-yellow-500 px-4 py-2 font-medium text-white hover:bg-yellow-600'
            onClick={() => testLogTrace('warn')}
          >
            Warning Trace
          </button>
          <button
            className='rounded bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600'
            onClick={() => testLogTrace('error')}
          >
            Error Trace
          </button>
          <button
            className='rounded bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600'
            onClick={() => testLogTrace('critical')}
          >
            Critical Trace
          </button>
        </div>
      </div>

      {/* Advanced Testing */}
      <div className='rounded-lg border border-orange-200 bg-orange-50 p-4'>
        <h2 className='mb-3 text-xl font-semibold text-orange-800'>Advanced Testing</h2>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          <button
            className='rounded bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700'
            onClick={testLogDependency}
          >
            Test API Dependency (Random Success/Fail)
          </button>
        </div>
      </div>

      {/* Error Testing */}
      <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
        <h2 className='mb-3 text-xl font-semibold text-red-800'>Error Handler Testing</h2>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          <button
            className='rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700'
            onClick={testErrorBoundary}
          >
            Test Error Boundary
          </button>
          <button
            className='rounded bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800'
            onClick={testGlobalError}
          >
            Test Global Error Handler
          </button>
          <button
            className='rounded bg-red-800 px-4 py-2 font-medium text-white hover:bg-red-900'
            onClick={testUnhandledPromiseRejection}
          >
            Test Promise Rejection
          </button>
        </div>
        <p className='mt-2 text-sm text-red-600'>
          ⚠️ These will trigger actual errors - check browser console and Application Insights
        </p>
      </div>

      {/* Test Results */}
      <div className='rounded-lg border border-gray-300 bg-white p-4'>
        <h2 className='mb-3 text-xl font-semibold text-gray-800'>Test Results (Last 10)</h2>
        {testResults.length === 0 ? (
          <p className='text-gray-500 italic'>
            No tests run yet. Click buttons above to start testing!
          </p>
        ) : (
          <ul className='space-y-1 font-mono text-sm'>
            {testResults.map((result, index) => (
              <li key={index} className='border-b border-gray-100 pb-1 text-gray-700'>
                {result}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
