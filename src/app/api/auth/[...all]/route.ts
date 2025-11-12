import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

// Helper function to handle all HTTP methods with proper error handling
async function handleRequest(request: NextRequest, method: string) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Log request details for debugging (only in production for critical errors)
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction || pathname.includes('sign-in')) {
    console.log('Auth request:', {
      pathname,
      method: request.method,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      baseURL: process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || 'not set',
      origin: request.headers.get('origin'),
      host: request.headers.get('host'),
    });
  }

  try {
    let response: Response;
    
    // Call the appropriate handler method
    switch (method) {
      case 'GET':
        response = await handler.GET(request);
        break;
      case 'POST':
        response = await handler.POST(request);
        break;
      case 'PUT':
        response = await handler.PUT?.(request) || new Response('Method not allowed', { status: 405 });
        break;
      case 'PATCH':
        response = await handler.PATCH?.(request) || new Response('Method not allowed', { status: 405 });
        break;
      case 'DELETE':
        response = await handler.DELETE?.(request) || new Response('Method not allowed', { status: 405 });
        break;
      default:
        // Try to use the handler's all method if available, or return 405
        if (typeof (handler as any).all === 'function') {
          response = await (handler as any).all(request);
        } else {
          return NextResponse.json(
            { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
            { status: 405 }
          );
        }
    }
    
    // Log error responses
    if (response.status >= 400) {
      console.error('Better Auth error response:', {
        status: response.status,
        statusText: response.statusText,
        pathname,
        method: request.method,
      });
      
      // For 500 errors, try to read and log the error body
      if (response.status === 500) {
        try {
          const clonedResponse = response.clone();
          let errorBody: any = null;
          
          try {
            errorBody = await clonedResponse.json();
          } catch {
            try {
              const errorText = await clonedResponse.text();
              errorBody = { message: errorText };
            } catch {
              // Could not read body
            }
          }
          
          if (errorBody) {
            console.error('Better Auth 500 error details:', JSON.stringify(errorBody, null, 2));
            
            // Check for database-related errors
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
              errorMessage.includes('does not exist') ||
              errorMessage.includes('relation "user" does not exist');
            
            // Return a properly formatted error response
            return NextResponse.json(
              {
                error: errorBody.error || (isDatabaseError ? 'Database connection error' : 'Internal server error'),
                message: errorBody.message || errorBody.error || (isDatabaseError ? 'Unable to connect to the database' : 'An unexpected error occurred'),
                code: errorBody.code || (isDatabaseError ? 'DATABASE_ERROR' : 'AUTH_ERROR'),
              },
              { status: 500 }
            );
          }
        } catch (e) {
          console.error('Error reading 500 response body:', e);
        }
      }
    }
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Better Auth handler error:', {
      error,
      message: errorMessage,
      stack: errorStack,
      pathname,
      method: request.method,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    });
    
    // Return the error response from Better Auth if it's a Response object
    if (error instanceof Response) {
      return error;
    }
    
    // Check if it's a database connection error
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
    
    if (isDatabaseError) {
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

// Export handlers for all HTTP methods
export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}