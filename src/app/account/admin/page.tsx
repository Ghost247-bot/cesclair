"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function AccountAdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      // Redirect to the main admin page
      router.replace("/admin");
    }
  }, [isPending, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-body">Redirecting to admin panel...</p>
      </div>
    </div>
  );
}

