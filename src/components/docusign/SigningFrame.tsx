"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface SigningFrameProps {
  contractId: number;
  envelopeId?: string;
  signerEmail: string;
  signerName: string;
  contractTitle: string;
  contractDescription: string;
  amount: string;
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
  onSigningComplete,
  onError,
}: SigningFrameProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement DocuSign signing flow
    // For now, this is a placeholder component
    setLoading(false);
  }, [contractId, envelopeId]);

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
      </div>
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
        <p className="text-yellow-800 text-sm">
          DocuSign integration is not yet configured. This is a placeholder component.
        </p>
      </div>
      <button
        onClick={onSigningComplete}
        className="px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
      >
        Simulate Signing Complete
      </button>
    </div>
  );
}

