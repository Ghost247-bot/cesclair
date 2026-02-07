const SIGNWELL_API_BASE = process.env.SIGNWELL_API_BASE || 'https://www.signwell.com/api/v1';
const SIGNWELL_API_KEY = process.env.SIGNWELL_API_KEY;

/** Error thrown by SignWell client with a stable code for API responses */
export class SignWellError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'SignWellError';
    Object.setPrototypeOf(this, SignWellError.prototype);
  }
}

/** Check if an error indicates SignWell is not configured */
export function isSignWellNotConfiguredError(error: unknown): boolean {
  if (error instanceof SignWellError && error.code === 'SIGNWELL_NOT_CONFIGURED') return true;
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('signwell_api_key') ||
    msg.includes('not set') ||
    msg.includes('not configured') ||
    msg.includes('not initialized')
  );
}

/** Turn a SignWell error into a consistent JSON body and HTTP status for API routes */
export function toSignWellApiErrorResponse(error: unknown): {
  body: { error: string; code: string; details?: string };
  status: number;
} {
  if (isSignWellNotConfiguredError(error)) {
    return {
      body: {
        error: 'SignWell API is not configured. Set SIGNWELL_API_KEY in your environment.',
        code: 'SIGNWELL_NOT_CONFIGURED',
      },
      status: 503,
    };
  }
  if (error instanceof SignWellError) {
    const details = error.details != null ? String(error.details) : undefined;
    return {
      body: {
        error: error.message,
        code: error.code,
        ...(details && { details }),
      },
      status: error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 502,
    };
  }
  const message = error instanceof Error ? error.message : String(error);
  const isNotFound =
    message.toLowerCase().includes('not found') ||
    message.includes('404');
  return {
    body: {
      error: isNotFound ? 'Document not found in SignWell' : `SignWell error: ${message}`,
      code: isNotFound ? 'DOCUMENT_NOT_FOUND' : 'SIGNWELL_API_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: message }),
    },
    status: isNotFound ? 404 : 502,
  };
}

export interface SignWellDocument {
  id?: string;
  name: string;
  file_url?: string;
  file_data?: string;
  recipients: SignWellRecipient[];
  test_mode?: boolean;
  embedded_signing?: boolean;
  embedded_signing_notifications?: boolean;
  apply_signing_order?: boolean;
  message?: string;
  subject?: string;
}

export interface SignWellRecipient {
  email: string;
  name: string;
  role: 'signer' | 'approver' | 'cc';
  order?: number;
}

export interface SignWellResponse {
  id: string;
  status: string;
  signing_url?: string;
  document_url?: string;
  recipients?: Array<{
    email: string;
    name: string;
    status: string;
    signing_url?: string;
  }>;
}

export interface SignWellStatusResponse {
  id: string;
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined' | 'cancelled';
  document_url?: string;
  signing_url?: string;
  completed_at?: string;
  recipients?: Array<{
    email: string;
    name: string;
    status: string;
    signed_at?: string;
  }>;
}

export class SignWellClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    if (!SIGNWELL_API_KEY?.trim()) {
      throw new SignWellError(
        'SIGNWELL_API_KEY environment variable is not set. SignWell features are disabled.',
        'SIGNWELL_NOT_CONFIGURED'
      );
    }
    this.apiKey = SIGNWELL_API_KEY;
    this.baseUrl = SIGNWELL_API_BASE;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Set authorization header
    if (this.apiKey.startsWith('access:')) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsed: { message?: string; error?: string };
        try {
          parsed = JSON.parse(errorText);
        } catch {
          parsed = { message: errorText || response.statusText };
        }
        const errorMessage = parsed.message || parsed.error || response.statusText || 'Unknown error';
        const isNotFound = response.status === 404;
        console.error(`SignWell API error [${response.status}]:`, errorMessage);
        throw new SignWellError(
          errorMessage,
          isNotFound ? 'DOCUMENT_NOT_FOUND' : 'SIGNWELL_API_ERROR',
          response.status,
          parsed
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof SignWellError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      console.error('SignWell API request failed:', error);
      throw new SignWellError(
        `Request failed: ${message}`,
        'SIGNWELL_NETWORK_ERROR',
        502,
        process.env.NODE_ENV === 'development' ? message : undefined
      );
    }
  }

  async createDocument(document: SignWellDocument): Promise<SignWellResponse> {
    return this.request<SignWellResponse>('/documents', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  async getDocumentStatus(documentId: string): Promise<SignWellStatusResponse> {
    return this.request<SignWellStatusResponse>(`/documents/${documentId}`);
  }

  async sendDocument(documentId: string): Promise<SignWellResponse> {
    return this.request<SignWellResponse>(`/documents/${documentId}/send`, {
      method: 'POST',
    });
  }

  async createAndSendDocument(
    document: SignWellDocument
  ): Promise<SignWellResponse> {
    const created = await this.createDocument(document);
    return this.sendDocument(created.id);
  }

  async listDocuments(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<{
    documents: Array<{
      id: string;
      name: string;
      status: string;
      created_at: string;
      updated_at: string;
      document_url?: string;
      recipients?: Array<{
        email: string;
        name: string;
        status: string;
      }>;
    }>;
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = `/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{
      documents: Array<{
        id: string;
        name: string;
        status: string;
        created_at: string;
        updated_at: string;
        document_url?: string;
        recipients?: Array<{
          email: string;
          name: string;
          status: string;
        }>;
      }>;
      pagination?: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
      };
    }>(endpoint);
  }

  async sendDocumentToUsers(
    documentId: string,
    recipients: Array<{ email: string; name: string }>
  ): Promise<SignWellResponse> {
    // First get the document to see its current state
    const doc = await this.getDocumentStatus(documentId);
    
    // Create updated document with new recipients
    // Note: SignWell API may require different approach - this is a placeholder
    // You may need to use updateDocument or sendDocument with recipient updates
    return this.request<SignWellResponse>(`/documents/${documentId}/send`, {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients.map((r, index) => ({
          email: r.email,
          name: r.name,
          role: 'signer',
          order: index + 1,
        })),
      }),
    });
  }

  async uploadDocument(
    fileData: string, // base64 encoded file data
    name: string,
    recipients?: Array<{ email: string; name: string }>
  ): Promise<SignWellResponse> {
    // Create document with file_data
    const document: SignWellDocument = {
      name,
      file_data: fileData,
      recipients: recipients?.map((r, index) => ({
        email: r.email,
        name: r.name,
        role: 'signer' as const,
        order: index + 1,
      })) || [],
    };

    return this.createDocument(document);
  }
}

// Safely initialize SignWell client
let signWellClientInstance: SignWellClient | null = null;

try {
  if (SIGNWELL_API_KEY) {
    signWellClientInstance = new SignWellClient();
  } else {
    console.warn('SIGNWELL_API_KEY is not set. SignWell features will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize SignWell client:', error);
  signWellClientInstance = null;
}

export const signWellClient = signWellClientInstance;

