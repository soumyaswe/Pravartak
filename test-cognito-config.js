// Run this in your browser console to verify Cognito configuration
console.log('=== COGNITO CONFIGURATION TEST ===');
console.log('User Pool ID:', process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID);
console.log('Client ID:', process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID);
console.log('Region:', process.env.NEXT_PUBLIC_AWS_REGION);
console.log('Domain:', process.env.NEXT_PUBLIC_COGNITO_DOMAIN);

// Check if values are actually loaded
const hasUserPool = !!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const hasClientId = !!process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

console.log('\nConfiguration Status:');
console.log('Has User Pool ID:', hasUserPool);
console.log('Has Client ID:', hasClientId);
console.log('Is Configured:', hasUserPool && hasClientId);
