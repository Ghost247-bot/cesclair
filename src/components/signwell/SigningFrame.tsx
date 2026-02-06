"use client";

import { useState, useEffect } from "react";
import { Loader2, ExternalLink } from "lucide-react";

interface SigningFrameProps {
  contractId: number;
  envelopeId?: string;
  signerEmail: string;
  signerName: string;
  contractTitle: string;
  contractDescription: string;
  amount: string;
  contractFileUrl?: string | null;
  onSigningComplete: () => void;
  onError: (error: string) => void;
}

export function SigningFrame({
  contractId,
  envelopeId,
  signerEmail,
  signerName,
  contractTitle,
  contractDescription,
  amount,
  contractFileUrl,
  onSigningComplete,
  onError,
}: SigningFrameProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(envelopeId || null);
  const [status, setStatus] = useState<string>("pending");

  useEffect(() => {
    const initializeSigning = async () => {
      try {
        setLoading(true);

        if (documentId) {
          const statusRes = await fetch(`/api/signwell/status?documentId=${documentId}&contractId=${contractId}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            setStatus(statusData.status);
            if (statusData.signingUrl) {
              setSigningUrl(statusData.signingUrl);
            }
            if (statusData.status === 'signed' || statusData.status === 'completed') {
              onSigningComplete();
              return;
            }
          }
        }

        if (!documentId && contractFileUrl) {
          const createRes = await fetch('/api/signwell/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contractId,
              fileUrl: contractFileUrl,
              signerEmail,
              signerName,
              contractTitle,
            }),
          });

          if (!createRes.ok) {
            const errorData = await createRes.json();
            throw new Error(errorData.error || 'Failed to create signing document');
          }

          const createData = await createRes.json();
          setDocumentId(createData.documentId);
          setSigningUrl(createData.signingUrl);
          setStatus('sent');
        } else if (!contractFileUrl) {
          throw new Error('Contract file is required for signing');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize signing';
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeSigning();
  }, [contractId, documentId, contractFileUrl, signerEmail, signerName, contractTitle, onSigningComplete, onError]);

  useEffect(() => {
    if (documentId && status !== 'signed' && status !== 'completed') {
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/signwell/status?documentId=${documentId}&contractId=${contractId}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            setStatus(statusData.status);
            if (statusData.status === 'signed' || statusData.status === 'completed') {
              onSigningComplete();
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error('Error checking status:', err);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [documentId, contractId, status, onSigningComplete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-body">Loading signing interface...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => onError(error)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border p-6 rounded">
      <h3 className="text-xl font-medium mb-4">Contract Signing</h3>
      <div className="space-y-4 mb-6">
        <div>
          <span className="text-label text-muted-foreground">Contract:</span>
          <p className="text-body">{contractTitle}</p>
        </div>
        {contractDescription && (
          <div>
            <span className="text-label text-muted-foreground">Description:</span>
            <p className="text-body">{contractDescription}</p>
          </div>
        )}
        <div>
          <span className="text-label text-muted-foreground">Amount:</span>
          <p className="text-body">${parseFloat(amount).toFixed(2)}</p>
        </div>
        <div>
          <span className="text-label text-muted-foreground">Signer:</span>
          <p className="text-body">{signerName} ({signerEmail})</p>
        </div>
        <div>
          <span className="text-label text-muted-foreground">Status:</span>
          <p className="text-body capitalize">{status}</p>
        </div>
      </div>
      {signingUrl ? (
        <div className="space-y-4">
          <a
            href={signingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Signing Page</span>
          </a>
          <p className="text-sm text-muted-foreground">
            Click the button above to open the signing page in a new window. Once you've signed, the status will update automatically.
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
          <p className="text-yellow-800 text-sm">
            Signing URL is being prepared. Please wait...
          </p>
        </div>
      )}
    </div>
  );
}

