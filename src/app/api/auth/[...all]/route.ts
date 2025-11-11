import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

// Wrap handlers with error logging and better error handling
export async function POST(request: NextRequest) {
  try {
    // Better Auth's toNextJsHandler should handle the request automatically
    // It expects the request object directly
    const response = await handler.POST(request);
    
    // Log response status for debugging
    if (response.status >= 400) {
      console.error('Better Auth POST returned error status:', {
        status: response.status,
        statusText: response.statusText,
        url: request.url,
        pathname: new URL(request.url).pathname,
      });
      
      // Try to read the response body for error details
      try {
        const clonedResponse = response.clone();
        const errorBody = await clonedResponse.json().catch(() => null);
        if (errorBody) {
          console.error('Better Auth error response:', JSON.stringify(errorBody, null, 2));
        } else {
          // Try to read as text if JSON fails
          const textBody = await clonedResponse.text().catch(() => null);
          if (textBody) {
            console.error('Better Auth error response (text):', textBody);
          }
        }
      } catch (e) {
        // Ignore errors reading response body
        console.error('Error reading response body:', e);
      }
    }
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log the full error for debugging
    console.error('Better Auth POST error (caught):', {
      error,
      message: errorMessage,
      stack: errorStack,
      url: request.url,
      method: request.method,
      errorType: error?.constructor?.name,
      errorName: error instanceof Error ? error.name : typeof error,
    });
    
    // Return the error response from Better Auth if it's a Response object
    if (error instanceof Response) {
      return error;
    }
    
    // Check if it's a database connection error
    if (
      errorMessage.includes('database') || 
      errorMessage.includes('connection') || 
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('ETIMEDOUT') ||
      errorMessage.includes('Pool') ||
      errorMessage.includes('neon') ||
      errorMessage.includes('postgres')
    ) {
      console.error('Database connection error detected:', {
        error: errorMessage,
        stack: errorStack,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      });
      return NextResponse.json(
        { 
          error: 'Database connection error',
          message: 'Unable to connect to the database. Please try again later.',
          code: 'DATABASE_ERROR',
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Authentication error',
        message: errorMessage,
        code: 'AUTH_ERROR',
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const response = await handler.GET(request);
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Better Auth GET error:', {
      message: errorMessage,
      stack: errorStack,
      url: request.url,
      method: request.method,
    });
    
    // Return the error response from Better Auth if it's a Response object
    if (error instanceof Response) {
      return error;
    }
    
    return NextResponse.json(
      { 
        error: 'Authentication error',
        message: errorMessage,
        code: 'AUTH_ERROR'
      },
      { status: 500 }
    );
  }
}