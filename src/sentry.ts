import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

export default function sentryInit() {
  console.log('Sentry error tracing is enabled.');
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_NETWORK,
    integrations: [new Integrations.BrowserTracing()],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  });
}
