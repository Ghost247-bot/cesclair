"use client";

import { useSession, authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";

interface AccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountMenu({ isOpen, onClose }: AccountMenuProps) {
  const { data: session, refetch } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-border shadow-lg z-50">
        {session?.user ? (
          <div className="py-2">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-body-small font-medium">{session.user.name}</p>
              <p className="text-caption text-muted-foreground">{session.user.email}</p>
            </div>
            
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-body hover:bg-secondary transition-colors"
            >
              <User className="w-4 h-4" />
              <span>My Account</span>
            </Link>

            {session.user.role === "member" && (
              <Link
                href="/cesworld/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-body hover:bg-secondary transition-colors"
              >
                <User className="w-4 h-4" />
                <span>CESWORLD Dashboard</span>
              </Link>
            )}

            {session.user.role === "designer" && (
              <Link
                href="/cesworld/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-body hover:bg-secondary transition-colors"
              >
                <User className="w-4 h-4" />
                <span>CESWORLD Dashboard</span>
              </Link>
            )}

            {session.user.role === "admin" && (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-body hover:bg-secondary transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 text-body hover:bg-secondary transition-colors w-full text-left border-t border-border"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="py-2">
            <Link
              href="/cesworld/login"
              onClick={onClose}
              className="block px-4 py-3 text-body hover:bg-secondary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/cesworld/register"
              onClick={onClose}
              className="block px-4 py-3 text-body hover:bg-secondary transition-colors"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </>
  );
}