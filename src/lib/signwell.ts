const SIGNWELL_API_BASE = process.env.SIGNWELL_API_BASE || 'https://www.signwell.com/api/v1';
const SIGNWELL_API_KEY = process.env.SIGNWELL_API_KEY;

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
    if (!SIGNWELL_API_KEY) {
      throw new Error('SIGNWELL_API_KEY environment variable is not set');
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

    if (this.apiKey.startsWith('access:')) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || response.statusText };
      }
      throw new Error(`SignWell API error: ${error.message || response.statusText} (${response.status})`);
    }

    return response.json();
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
}

export const signWellClient = SIGNWELL_API_KEY ? new SignWellClient() : null;

