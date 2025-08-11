import { clerkConfig } from '@clerk/nextjs/server';

export const clerkConfigOptions = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_demo',
  secretKey: process.env.CLERK_SECRET_KEY || 'sk_test_demo',
  signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
  signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
  afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/dashboard',
  afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/dashboard',
};

// Configuración por defecto para desarrollo
export const defaultClerkConfig = {
  publishableKey: 'pk_test_demo',
  secretKey: 'sk_test_demo',
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
}; 