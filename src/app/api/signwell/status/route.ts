import { NextRequest, NextResponse } from 'next/server';
import { signWellClient } from '@/lib/signwell';
import { db } from '@/db';
import { contracts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    if (!signWellClient) {
      console.error('SignWell client is not initialized. Check SIGNWELL_API_KEY environment variable.');
      return NextResponse.json(
        { 
          error: 'SignWell API is not configured',
          code: 'SIGNWELL_NOT_CONFIGURED'
        },
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

    // Get document status from SignWell
    let status;
    try {
      console.log(`Fetching SignWell document status: id=${docId}`);
      status = await signWellClient.getDocumentStatus(docId);
      console.log(`Document status: ${status.status}`);
    } catch (signWellError) {
      console.error('SignWell API error during status check:', signWellError);
      const errorMessage = signWellError instanceof Error ? signWellError.message : String(signWellError);
      // Check if it's a 404 or other error
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        return NextResponse.json(
          {
            error: 'Document not found in SignWell',
            code: 'DOCUMENT_NOT_FOUND',
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          error: 'Failed to get document status from SignWell',
          code: 'SIGNWELL_API_ERROR',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 500 }
      );
    }

    // Update contract in database if contractId is provided
    if (contractId) {
      try {
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
      } catch (dbError) {
        console.error('Error updating contract in database:', dbError);
        // Continue even if database update fails
      }
    }

    return NextResponse.json({
      status: status.status,
      documentUrl: status.document_url,
      signingUrl: status.signing_url,
      completedAt: status.completed_at,
      recipients: status.recipients,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('SignWell status error:', errorMessage);
    if (errorStack) {
      console.error('Error stack:', errorStack);
    }
    return NextResponse.json(
      { 
        error: 'Failed to get document status',
        code: 'STATUS_ERROR',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

