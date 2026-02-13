"use client";

import { useSession, authClient, robustSignOut } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Shield, Scissors, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface AccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface AccountMenuButtonProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const AccountMenuButton: React.FC<AccountMenuButtonProps> = ({ href, children, onClick, className }) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 text-body hover:bg-secondary transition-colors ${className || ''}`}
  >
    {children}
  </Link>
);

export default function AccountMenu({ isOpen, onClose, className }: AccountMenuProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = () => {
    onClose();
    router.push("/");
    robustSignOut(); // end session in background so page logs out immediately
  };

  if (!isOpen || !session?.user) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-border shadow-lg z-50">
        <div className={`px-4 py-3 ${className || ''}`}>
          <div className="py-2">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-body-small font-medium">{session.user.name}</p>
              <p className="text-caption text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
          
          <AccountMenuButton href="/account">
            <User className="w-4 h-4" />
            <span>My Account</span>
          </AccountMenuButton>
          
          {session.user.role === "member" && (
            <AccountMenuButton href="/cesworld/dashboard">
              <User className="w-4 h-4" />
              <span>CESWORLD Dashboard</span>
            </AccountMenuButton>
          )}
          
          {session.user.role === "designer" && (
            <AccountMenuButton href="/designers/dashboard">
              <User className="w-4 h-4" />
              <span>Designer Dashboard</span>
            </AccountMenuButton>
          )}
          
          {session.user.role === "admin" && (
            <AccountMenuButton href="/admin">
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </AccountMenuButton>
          )}
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 text-body hover:bg-secondary transition-colors w-full text-left border-t border-border"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
