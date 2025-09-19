#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up CFS Platform test environment...\n')

// Test environment variables
const testEnv = `# CFS Platform - Test Environment
# This file contains mock values for development without real services

# Database (SQLite for testing)
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key-for-development-only-not-for-production"

# OAuth Providers (Mock values)
GOOGLE_CLIENT_ID="test-google-client-id"
GOOGLE_CLIENT_SECRET="test-google-client-secret"
APPLE_CLIENT_ID="test-apple-client-id"
APPLE_CLIENT_SECRET="test-apple-client-secret"

# WalletConnect (Mock)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="test-walletconnect-project-id"
WALLETCONNECT_PROJECT_ID="test-walletconnect-project-id"

# Stripe (Mock test keys)
STRIPE_PUBLISHABLE_KEY="pk_test_mock_stripe_key_1234567890"
STRIPE_SECRET_KEY="sk_test_mock_stripe_key_1234567890"
STRIPE_WEBHOOK_SECRET="whsec_test_mock_webhook_secret"

# Redis (Mock - will use in-memory fallback)
REDIS_URL="redis://localhost:6379"

# Sports Data API (Mock)
SPORTRADAR_API_KEY="test-sportradar-api-key"
OPTA_API_KEY="test-opta-api-key"

# KYC/AML (Mock)
PERSONA_API_KEY="test-persona-api-key"
ONFIDO_API_TOKEN="test-onfido-api-token"

# Fraud Detection (Mock)
SIFT_API_KEY="test-sift-api-key"
FINGERPRINT_API_KEY="test-fingerprint-api-key"

# Messaging (Mock)
ONESIGNAL_APP_ID="test-onesignal-app-id"
ONESIGNAL_API_KEY="test-onesignal-api-key"
POSTMARK_API_TOKEN="test-postmark-api-token"

# Analytics (Mock)
MIXPANEL_TOKEN="test-mixpanel-token"
GOOGLE_ANALYTICS_ID="test-ga-id"

# Monitoring (Mock)
SENTRY_DSN="https://test-sentry-dsn@sentry.io/test"
DATADOG_API_KEY="test-datadog-api-key"

# Feature Flags (Mock)
LAUNCHDARKLY_SDK_KEY="test-launchdarkly-sdk-key"

# Environment
NODE_ENV="development"

# Mock Mode Flags
MOCK_SERVICES="true"
MOCK_DATABASE="true"
MOCK_PAYMENTS="true"
MOCK_AUTH="true"
`

// Write .env.local file
const envPath = path.join(process.cwd(), '.env.local')

// Ensure the directory exists
const envDir = path.dirname(envPath)
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true })
}

fs.writeFileSync(envPath, testEnv)

console.log('✅ Created .env.local with test environment variables')
console.log('📝 All services are configured with mock values')
console.log('🔧 The app will show as if all services are connected')
console.log('⚠️  Remember to replace with real values for production\n')

console.log('🚀 Next steps:')
console.log('1. Run: npm install')
console.log('2. Run: npm run db:generate')
console.log('3. Run: npm run dev')
console.log('4. Open: http://localhost:3000\n')

console.log('🎉 Your CFS platform is ready for development!')
