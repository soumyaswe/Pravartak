/**
 * Environment variable validation utility
 * Validates required environment variables at application startup
 */

const requiredEnvVars = {
  production: [
    'DATABASE_URL',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'GOOGLE_GENERATIVE_AI_API_KEY',
  ],
  development: [
    'DATABASE_URL',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ],
};

/**
 * Validates that all required environment variables are present
 * @param {string} environment - 'production' or 'development'
 * @returns {Object} - { valid: boolean, missing: string[], warnings: string[] }
 */
export function validateEnvironment(environment = process.env.NODE_ENV || 'development') {
  const required = requiredEnvVars[environment] || requiredEnvVars.development;
  const missing = [];
  const warnings = [];

  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check for optional but recommended variables
  const recommended = [
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
    'INNGEST_EVENT_KEY',
    'INNGEST_SIGNING_KEY',
  ];

  for (const varName of recommended) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Throws an error if required environment variables are missing
 * Use this at application startup
 */
export function ensureEnvironmentVariables() {
  const validation = validateEnvironment();

  if (!validation.valid) {
    const missingVars = validation.missing.join(', ');
    throw new Error(
      `Missing required environment variables: ${missingVars}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  if (validation.warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ Warning: Optional environment variables missing:',
      validation.warnings.join(', ')
    );
  }
}

/**
 * Returns a safe subset of environment variables for client-side use
 * Only returns NEXT_PUBLIC_ prefixed variables
 */
export function getPublicEnvVars() {
  const publicVars = {};
  
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('NEXT_PUBLIC_')) {
      publicVars[key] = value;
    }
  }
  
  return publicVars;
}
