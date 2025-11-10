"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/sections/footer";

function SigningCompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const contractId = searchParams.get("contractId");

  useEffect(() => {
    // Simulate processing delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
          <div className="container mx-auto py-16">
            <div className="max-w-2xl mx-auto text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
              <h1 className="text-3xl font-medium mb-4">Processing Your Signature...</h1>
              <p className="text-body-large text-muted-foreground">
                Please wait while we complete your contract signing.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
        <div className="container mx-auto py-16">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-medium mb-4">Contract Signed Successfully!</h1>
            <p className="text-body-large text-muted-foreground mb-8">
              Your contract has been signed and submitted. You will receive a confirmation email shortly.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Link
                href="/designers/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <span className="text-button-primary">GO TO DASHBOARD</span>
              </Link>
              <Link
                href="/designers"
                className="inline-flex items-center justify-center px-8 py-4 border border-primary hover:bg-secondary transition-colors"
              >
                <span className="text-button-primary">VIEW DESIGNERS</span>
              </Link>
            </div>

            {contractId && (
              <p className="text-caption text-muted-foreground mt-8">
                Contract ID: {contractId}
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SigningCompletePage() {
  return (
    <Suspense fallback={
      <>
        <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
          <div className="container mx-auto py-16">
            <div className="max-w-2xl mx-auto text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
              <h1 className="text-3xl font-medium mb-4">Loading...</h1>
            </div>
          </div>
        </main>
        <Footer />
      </>
    }>
      <SigningCompleteContent />
    </Suspense>
  );
}
