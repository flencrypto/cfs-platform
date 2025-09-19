// Mock configuration for development without real services
// This allows the app to run and show as if services are connected

export const mockConfig = {
  // Database
  database: {
    url: "file:./dev.db", // SQLite for testing
    connected: true,
    type: "sqlite" as const,
  },

  // Authentication
  auth: {
    nextAuthSecret: "test-secret-key-for-development-only",
    googleClientId: "test-google-client-id",
    googleClientSecret: "test-google-client-secret",
    appleClientId: "test-apple-client-id",
    appleClientSecret: "test-apple-client-secret",
    walletConnectProjectId: "test-walletconnect-project-id",
    connected: true,
  },

  // Payments
  payments: {
    stripePublishableKey: "pk_test_mock_stripe_key_1234567890",
    stripeSecretKey: "sk_test_mock_stripe_key_1234567890",
    stripeWebhookSecret: "whsec_test_mock_webhook_secret",
    connected: true,
    mode: "test" as const,
  },

  // Redis
  redis: {
    url: "redis://localhost:6379",
    connected: false, // Will use in-memory fallback
    fallback: "memory" as const,
  },

  // Sports Data
  sportsData: {
    sportradarApiKey: "test-sportradar-api-key",
    optaApiKey: "test-opta-api-key",
    connected: true,
    mode: "mock" as const,
  },

  // KYC/AML
  kyc: {
    personaApiKey: "test-persona-api-key",
    onfidoApiToken: "test-onfido-api-token",
    connected: true,
    mode: "mock" as const,
  },

  // Fraud Detection
  fraud: {
    siftApiKey: "test-sift-api-key",
    fingerprintApiKey: "test-fingerprint-api-key",
    connected: true,
    mode: "mock" as const,
  },

  // Messaging
  messaging: {
    onesignalAppId: "test-onesignal-app-id",
    onesignalApiKey: "test-onesignal-api-key",
    postmarkApiToken: "test-postmark-api-token",
    connected: true,
    mode: "mock" as const,
  },

  // Analytics
  analytics: {
    mixpanelToken: "test-mixpanel-token",
    googleAnalyticsId: "test-ga-id",
    connected: true,
    mode: "mock" as const,
  },

  // Monitoring
  monitoring: {
    sentryDsn: "https://test-sentry-dsn@sentry.io/test",
    datadogApiKey: "test-datadog-api-key",
    connected: true,
    mode: "mock" as const,
  },

  // Feature Flags
  featureFlags: {
    launchdarklySdkKey: "test-launchdarkly-sdk-key",
    connected: true,
    mode: "mock" as const,
  },

  // Environment
  environment: {
    nodeEnv: "development" as const,
    mockMode: true,
    showMockBanner: true,
  },
}

// Mock service status checker
export const getServiceStatus = () => {
  return {
    database: mockConfig.database.connected ? "connected" : "disconnected",
    auth: mockConfig.auth.connected ? "connected" : "disconnected",
    payments: mockConfig.payments.connected ? "connected" : "disconnected",
    redis: mockConfig.redis.connected ? "connected" : "fallback",
    sportsData: mockConfig.sportsData.connected ? "connected" : "disconnected",
    kyc: mockConfig.kyc.connected ? "connected" : "disconnected",
    fraud: mockConfig.fraud.connected ? "connected" : "disconnected",
    messaging: mockConfig.messaging.connected ? "connected" : "disconnected",
    analytics: mockConfig.analytics.connected ? "connected" : "disconnected",
    monitoring: mockConfig.monitoring.connected ? "connected" : "disconnected",
    featureFlags: mockConfig.featureFlags.connected ? "connected" : "disconnected",
  }
}

// Mock data for testing
export const mockData = {
  contests: [
    {
      id: "contest_1",
      name: "Premier League Showdown",
      sport: "Soccer",
      entryFee: 25,
      prizePool: 5000,
      maxEntries: 200,
      currentEntries: 156,
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
      lockTime: new Date(Date.now() + 90 * 60 * 1000),
      status: "ACTIVE",
      type: "DAILY",
      description: "Battle for the Premier League crown.",
      rosterSize: 11,
      salaryCap: 50000,
      scoringRules: {},
      isPrivate: false,
      inviteCode: null,
    },
    {
      id: "contest_2",
      name: "NBA Championship",
      sport: "Basketball",
      entryFee: 50,
      prizePool: 10000,
      maxEntries: 100,
      currentEntries: 89,
      startTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
      lockTime: new Date(Date.now() + 3.5 * 60 * 60 * 1000),
      status: "ACTIVE",
      type: "TOURNAMENT",
      description: "Playoff action for the NBA title.",
      rosterSize: 8,
      salaryCap: 60000,
      scoringRules: {},
      isPrivate: false,
      inviteCode: null,
    },
  ],
  sports: [
    {
      id: "soccer",
      name: "Soccer",
      slug: "soccer",
      displayName: "Soccer",
      isActive: true,
      rosterSize: 11,
      salaryCap: 50000,
      scoringRules: {},
    },
    {
      id: "nba",
      name: "NBA",
      slug: "nba",
      displayName: "NBA",
      isActive: true,
      rosterSize: 8,
      salaryCap: 60000,
      scoringRules: {},
    },
    {
      id: "nfl",
      name: "NFL",
      slug: "nfl",
      displayName: "NFL",
      isActive: true,
      rosterSize: 9,
      salaryCap: 55000,
      scoringRules: {},
    },
    {
      id: "ufc",
      name: "UFC",
      slug: "ufc",
      displayName: "UFC",
      isActive: true,
      rosterSize: 6,
      salaryCap: 45000,
      scoringRules: {},
    },
  ],
  users: [
    {
      id: "user_1",
      name: "Test User",
      email: "test@example.com",
      username: "testuser",
      image: null,
    },
  ],
}
