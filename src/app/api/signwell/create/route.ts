import { NextRequest, NextResponse } from 'next/server';
import { signWellClient } from '@/lib/signwell';
import { db } from '@/db';
import { contracts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    if (!signWellClient) {
      return NextResponse.json(
        { error: 'SignWell API is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { contractId, fileUrl, signerEmail, signerName, contractTitle } = body;

    if (!contractId || !fileUrl || !signerEmail || !signerName) {
      return NextResponse.json(
        { error: 'Missing required fields: contractId, fileUrl, signerEmail, signerName' },
        { status: 400 }
      );
    }

    const contract = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, contractId))
      .limit(1);

    if (contract.length === 0) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    const document = await signWellClient.createAndSendDocument({
      name: contractTitle || `Contract ${contractId}`,
      file_url: fileUrl,
      recipients: [
        {
          email: signerEmail,
          name: signerName,
          role: 'signer',
          order: 1,
        },
      ],
      test_mode: process.env.NODE_ENV !== 'production',
      embedded_signing: true,
      message: `Please sign the contract: ${contractTitle || `Contract ${contractId}`}`,
      subject: `Contract Signing: ${contractTitle || `Contract ${contractId}`}`,
    });

    await db
      .update(contracts)
      .set({
        envelopeId: document.id,
        envelopeStatus: 'sent',
        envelopeUrl: document.signing_url || document.document_url,
      })
      .where(eq(contracts.id, contractId));

    return NextResponse.json({
      success: true,
      documentId: document.id,
      signingUrl: document.signing_url,
      documentUrl: document.document_url,
    });
  } catch (error) {
    console.error('SignWell create error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create document' },
      { status: 500 }
    );
  }
}

