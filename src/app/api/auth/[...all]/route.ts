import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

// Wrap handlers with error logging and better error handling
export async function POST(request: NextRequest) {
  // Log request details for debugging
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  console.log('Auth POST request:', {
    pathname,
    method: request.method,
    hasAuthHeader: request.headers.get('authorization') ? true : false,
    hasCookie: request.headers.get('cookie') ? true : false,
  });

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
          let errorBody: any = null;
          let errorText: string | null = null;
          
          // Try to read as JSON first
          try {
            errorBody = await clonedResponse.json();
          } catch {
            // If JSON fails, try text
            try {
              errorText = await clonedResponse.text();
            } catch {
              // If both fail, we'll use a generic message
            }
          }
          
          if (errorBody) {
            console.error('Better Auth error response (JSON):', JSON.stringify(errorBody, null, 2));
            
            // Check for database-related errors in the response
            const errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
            const isDatabaseError = 
              errorMessage.includes('database') || 
              errorMessage.includes('connection') || 
              errorMessage.includes('ECONNREFUSED') ||
              errorMessage.includes('ENOTFOUND') ||
              errorMessage.includes('timeout') ||
              errorMessage.includes('ETIMEDOUT') ||
              errorMessage.includes('Pool') ||
              errorMessage.includes('neon') ||
              errorMessage.includes('postgres') ||
              errorMessage.includes('relation') ||
              errorMessage.includes('does not exist');
            
            // Return a properly formatted error response
            return NextResponse.json(
              {
                error: errorBody.error || (isDatabaseError ? 'Database connection error' : 'Internal server error'),
                message: errorBody.message || errorBody.error || (isDatabaseError ? 'Unable to connect to the database' : 'An unexpected error occurred'),
                code: errorBody.code || (isDatabaseError ? 'DATABASE_ERROR' : 'AUTH_ERROR'),
              },
              { status: 500 }
            );
          } else if (errorText) {
            console.error('Better Auth error response (text):', errorText);
            
            // Check if text contains database error indicators
            const isDatabaseError = 
              errorText.includes('database') || 
              errorText.includes('connection') || 
              errorText.includes('ECONNREFUSED') ||
              errorText.includes('ENOTFOUND') ||
              errorText.includes('timeout') ||
              errorText.includes('ETIMEDOUT') ||
              errorText.includes('Pool') ||
              errorText.includes('neon') ||
              errorText.includes('postgres') ||
              errorText.includes('relation') ||
              errorText.includes('does not exist');
            
            return NextResponse.json(
              {
                error: isDatabaseError ? 'Database connection error' : 'Internal server error',
                message: errorText || (isDatabaseError ? 'Unable to connect to the database' : 'An unexpected error occurred'),
                code: isDatabaseError ? 'DATABASE_ERROR' : 'AUTH_ERROR',
              },
              { status: 500 }
            );
          } else {
            // If we can't read the body at all, return a generic error
            console.error('Could not read error response body');
            return NextResponse.json(
              {
                error: 'Internal server error',
                message: 'An unexpected error occurred during authentication',
                code: 'AUTH_ERROR',
              },
              { status: 500 }
            );
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