import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { db } from "@/db";
import bcryptjs from "bcryptjs";
 
// Get base URL for auth - prioritize production URL
const getBaseURL = () => {
	// In production, try to detect from request headers if available
	if (process.env.NEXT_PUBLIC_SITE_URL) {
		return process.env.NEXT_PUBLIC_SITE_URL;
	}
	if (process.env.BETTER_AUTH_URL) {
		return process.env.BETTER_AUTH_URL;
	}
	// For production environments, try to construct from VERCEL_URL or similar
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	// Default to localhost for development
	return "http://localhost:3002";
};

const baseURL = getBaseURL();

// Log baseURL in production to help debug issues
if (process.env.NODE_ENV === 'production') {
	console.log('Better Auth baseURL:', baseURL);
	if (!process.env.NEXT_PUBLIC_SITE_URL && !process.env.BETTER_AUTH_URL) {
		console.warn('WARNING: NEXT_PUBLIC_SITE_URL or BETTER_AUTH_URL not set in production! Using:', baseURL);
		console.warn('This may cause authentication issues. Please set NEXT_PUBLIC_SITE_URL=https://cesclair.store');
	}
}

export const auth = betterAuth({
	secret: process.env.BETTER_AUTH_SECRET || "inFvd2NoE+kpwOMYTAhaWiQCb6qnAX7fP/tNaaiNb14=",
	baseURL: baseURL,
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {    
		enabled: true,
		requireEmailVerification: false,
		password: {
			hash: async (password: string) => {
				// Use bcryptjs to hash passwords (10 salt rounds)
				return await bcryptjs.hash(password, 10);
			},
			verify: async ({ password, hash }: { password: string; hash: string }) => {
				try {
					// Check if hash is valid
					if (!hash || typeof hash !== 'string') {
						console.error('Invalid hash format:', typeof hash, hash);
						return false;
					}
					
					// Check if password is valid
					if (!password || typeof password !== 'string') {
						console.error('Invalid password format:', typeof password);
						return false;
					}
					
					// Use bcryptjs to verify passwords
					const result = await bcryptjs.compare(password, hash);
					
					if (!result) {
						console.error('Password verification failed for hash:', hash.substring(0, 20) + '...');
					}
					
					return result;
				} catch (error) {
					console.error('Password verify error:', error);
					console.error('Hash format:', hash ? hash.substring(0, 20) + '...' : 'null/undefined');
					return false;
				}
			},
		},
	},
	plugins: [bearer()],
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},
	trustedOrigins: [
		getBaseURL(),
		"https://cesclair.store",
		"http://localhost:3001",
		"http://localhost:3000",
		"http://localhost:3002",
	],
});

// Session validation helper
export async function getCurrentUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}