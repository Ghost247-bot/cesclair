import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

// Wrap handlers with error logging and better error handling
export async function POST(request: NextRequest) {
  try {
    // Better Auth's toNextJsHandler should handle the request automatically
    // It expects the request object directly
    let response: Response;
    try {
      response = await handler.POST(request);
    } catch (handlerError) {
      // If the handler itself throws an error (not a Response), catch it
      const handlerErrorMessage = handlerError instanceof Error ? handlerError.message : String(handlerError);
      const handlerErrorStack = handlerError instanceof Error ? handlerError.stack : undefined;
      
      console.error('Better Auth handler threw an error:', {
        error: handlerError,
        message: handlerErrorMessage,
        stack: handlerErrorStack,
        url: request.url,
      });
      
      // Check if it's a database connection error
      if (
        handlerErrorMessage.includes('database') || 
        handlerErrorMessage.includes('connection') || 
        handlerErrorMessage.includes('ECONNREFUSED') ||
        handlerErrorMessage.includes('ENOTFOUND') ||
        handlerErrorMessage.includes('timeout') ||
        handlerErrorMessage.includes('ETIMEDOUT') ||
        handlerErrorMessage.includes('Pool') ||
        handlerErrorMessage.includes('neon') ||
        handlerErrorMessage.includes('postgres') ||
        handlerErrorMessage.includes('connect')
      ) {
        console.error('Database connection error in handler:', {
          error: handlerErrorMessage,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
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
      
      // Return a generic error response
      return NextResponse.json(
        { 
          error: 'Authentication error',
          message: handlerErrorMessage,
          code: 'AUTH_ERROR',
        },
        { status: 500 }
      );
    }
    
    // Log response status for debugging
    if (response.status >= 400) {
      console.error('Better Auth POST returned error status:', {
        status: response.status,
        statusText: response.statusText,
        url: request.url,
        pathname: new URL(request.url).pathname,
      });
      
      // For 500 errors, try to read and enhance the error response
      if (response.status === 500) {
        try {
          const clonedResponse = response.clone();
          const errorBody = await clonedResponse.json().catch(() => null);
          if (errorBody) {
            console.error('Better Auth error response:', JSON.stringify(errorBody, null, 2));
            
            // If the response doesn't have proper error format, enhance it
            if (!errorBody.code || !errorBody.message) {
              // Return a properly formatted error response
              return NextResponse.json(
                {
                  error: errorBody.error || 'Internal server error',
                  message: errorBody.message || errorBody.error || 'An unexpected error occurred',
                  code: errorBody.code || 'AUTH_ERROR',
                },
                { status: 500 }
              );
            }
          } else {
            // Try to read as text if JSON fails
            const textBody = await clonedResponse.text().catch(() => null);
            if (textBody) {
              console.error('Better Auth error response (text):', textBody);
              // Return a proper JSON error
              return NextResponse.json(
                {
                  error: 'Internal server error',
                  message: textBody || 'An unexpected error occurred',
                  code: 'AUTH_ERROR',
                },
                { status: 500 }
              );
            } else {
              // If we can't read the body at all, return a generic error
              return NextResponse.json(
                {
                  error: 'Internal server error',
                  message: 'An unexpected error occurred during authentication',
                  code: 'AUTH_ERROR',
                },
                { status: 500 }
              );
            }
          }
        } catch (e) {
          // If reading the response fails, return a generic error
          console.error('Error reading response body:', e);
          return NextResponse.json(
            {
              error: 'Internal server error',
              message: 'An unexpected error occurred',
              code: 'AUTH_ERROR',
            },
            { status: 500 }
          );
        }
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