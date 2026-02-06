import { NextRequest, NextResponse } from 'next/server';
import { signWellClient } from '@/lib/signwell';
import { db } from '@/db';
import { contracts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
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

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }

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

    // Create and send document via SignWell
    let document;
    try {
      console.log(`Creating SignWell document for contract ${contractId}`);
      document = await signWellClient.createAndSendDocument({
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
      console.log(`Successfully created SignWell document: id=${document.id}`);
    } catch (signWellError) {
      console.error('SignWell API error during create:', signWellError);
      const errorMessage = signWellError instanceof Error ? signWellError.message : String(signWellError);
      return NextResponse.json(
        {
          error: 'Failed to create document in SignWell',
          code: 'SIGNWELL_API_ERROR',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 500 }
      );
    }

    // Update contract in database
    try {
      await db
        .update(contracts)
        .set({
          envelopeId: document.id,
          envelopeStatus: 'sent',
          envelopeUrl: document.signing_url || document.document_url,
        })
        .where(eq(contracts.id, contractId));
    } catch (dbError) {
      console.error('Error updating contract in database:', dbError);
      // Document was created in SignWell but database update failed
      // Return success but log the error
    }

    return NextResponse.json({
      success: true,
      documentId: document.id,
      signingUrl: document.signing_url,
      documentUrl: document.document_url,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('SignWell create error:', errorMessage);
    if (errorStack) {
      console.error('Error stack:', errorStack);
    }
    return NextResponse.json(
      { 
        error: 'Failed to create document',
        code: 'CREATE_ERROR',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

