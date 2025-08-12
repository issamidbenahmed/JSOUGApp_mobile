const { ClerkExpressRequireAuth, clerkClient } = require('@clerk/clerk-sdk-node');

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is not set in environment variables');
}

if (!process.env.CLERK_PUBLISHABLE_KEY) {
  throw new Error('CLERK_PUBLISHABLE_KEY is not set in environment variables');
}

// Custom middleware to ensure we have the email in the session
const clerkAuth = (req, res, next) => {
  return ClerkExpressRequireAuth({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    onError: (error) => {
      console.error('Clerk authentication error:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    },
    // Ensure we have the email in the session claims
    sessionClaims: (claims) => {
      // If we don't have an email in the claims, try to get it from the user object
      if (!claims.email && claims.sub) {
        return {
          ...claims,
          email: claims.email_addresses?.[0]?.email_address || claims.email
        };
      }
      return claims;
    }
  })(req, res, next);
};

module.exports = clerkAuth;
