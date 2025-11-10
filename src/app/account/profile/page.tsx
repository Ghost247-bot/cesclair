"use client";

import { useEffect, useState } from 'react';
import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  image?: string | null;
  role: string;
}

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/cesworld/login?redirect=/account/profile');
    } else if (session?.user) {
      fetchProfile();
    }
  }, [session, isPending, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/account/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
        });
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        toast.success('Profile updated successfully');
        // Refetch session to update user data
        refetch();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user || !profile) {
    return null;
  }

  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-medium mb-8">My Profile</h1>
            
            <form onSubmit={handleSubmit} className="p-6 border border-border bg-white">
              <div className="space-y-6">
                <div>
                  <label className="block text-label mb-2">FULL NAME</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-label mb-2">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 border border-input bg-secondary text-muted-foreground"
                  />
                  <p className="text-caption text-muted-foreground mt-1">
                    Contact support to change your email address
                  </p>
                </div>
                <div>
                  <label className="block text-label mb-2">PHONE NUMBER (OPTIONAL)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-primary text-white py-4 px-6 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-button-primary">
                    {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
