import { NextRequest, NextResponse } from 'next/server';
import { signWellClient } from '@/lib/signwell';
import { db } from '@/db';
import { contracts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    if (!signWellClient) {
      return NextResponse.json(
        { error: 'SignWell API is not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const contractId = searchParams.get('contractId');

    if (!documentId && !contractId) {
      return NextResponse.json(
        { error: 'Either documentId or contractId is required' },
        { status: 400 }
      );
    }

    let docId = documentId;

    if (!docId && contractId) {
      const contract = await db
        .select({ envelopeId: contracts.envelopeId })
        .from(contracts)
        .where(eq(contracts.id, parseInt(contractId)))
        .limit(1);

      if (contract.length === 0 || !contract[0].envelopeId) {
        return NextResponse.json(
          { error: 'Contract not found or has no document ID' },
          { status: 404 }
        );
      }

      docId = contract[0].envelopeId;
    }

    if (!docId) {
      return NextResponse.json(
        { error: 'Document ID not found' },
        { status: 404 }
      );
    }

    const status = await signWellClient.getDocumentStatus(docId);

    if (contractId) {
      const statusMap: Record<string, string> = {
        'pending': 'pending',
        'sent': 'sent',
        'viewed': 'viewed',
        'signed': 'completed',
        'declined': 'declined',
        'cancelled': 'cancelled',
      };

      const envelopeStatus = statusMap[status.status] || status.status;

      await db
        .update(contracts)
        .set({
          envelopeStatus,
          signedAt: status.status === 'signed' && status.completed_at
            ? new Date(status.completed_at)
            : undefined,
          envelopeUrl: status.signing_url || status.document_url,
        })
        .where(eq(contracts.id, parseInt(contractId)));
    }

    return NextResponse.json({
      status: status.status,
      documentUrl: status.document_url,
      signingUrl: status.signing_url,
      completedAt: status.completed_at,
      recipients: status.recipients,
    });
  } catch (error) {
    console.error('SignWell status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get document status' },
      { status: 500 }
    );
  }
}

