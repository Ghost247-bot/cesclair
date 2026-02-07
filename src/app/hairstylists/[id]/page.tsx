"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Scissors, Briefcase, Mail, Edit, Trash2, Loader2, Upload, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { normalizeImagePath } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Hairstylist {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  portfolioUrl: string | null;
  specialties: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface HairstylistWork {
  id: number;
  hairstylistId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function HairstylistPortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [hairstylist, setHairstylist] = useState<Hairstylist | null>(null);
  const [works, setWorks] = useState<HairstylistWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    bio: "",
    portfolioUrl: "",
    specialties: "",
    avatarUrl: "",
    bannerUrl: "",
  });

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/hairstylists/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Hairstylist not found");
          throw new Error("Failed to fetch");
        }
        const data = await res.json();
        setHairstylist(data);
        setEditForm({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          portfolioUrl: data.portfolioUrl || "",
          specialties: data.specialties || "",
          avatarUrl: data.avatarUrl || "",
          bannerUrl: data.bannerUrl || "",
        });

        if (data.status !== "approved" && !isAdmin) {
          setError("This portfolio is not available.");
          setLoading(false);
          return;
        }

        const worksRes = await fetch(`/api/hairstylist-works?hairstylistId=${id}&limit=50`);
        if (worksRes.ok) {
          const worksData = await worksRes.json();
          setWorks(worksData.filter((w: HairstylistWork) => w.status !== "draft"));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, isAdmin]);

  const handleSave = async () => {
    if (!hairstylist) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/hairstylists/${hairstylist.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update");
      }
      const updated = await res.json();
      setHairstylist(updated);
      setShowEditModal(false);
      toast.success("Portfolio updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!hairstylist) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/hairstylists/${hairstylist.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      toast.success("Hairstylist deleted");
      router.push("/hairstylists");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
      setIsDeleting(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !hairstylist) return;
    try {
      setUploadingAvatar(true);
      const form = new FormData();
      form.append("file", file);
      form.append("hairstylistId", String(hairstylist.id));
      const res = await fetch("/api/upload/hairstylist/avatar", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      setEditForm((f) => ({ ...f, avatarUrl: data.url }));
      setHairstylist((h) => (h ? { ...h, avatarUrl: data.url } : null));
      toast.success("Avatar uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !hairstylist) return;
    try {
      setUploadingBanner(true);
      const form = new FormData();
      form.append("file", file);
      form.append("hairstylistId", String(hairstylist.id));
      const res = await fetch("/api/upload/hairstylist/banner", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      setEditForm((f) => ({ ...f, bannerUrl: data.url }));
      setHairstylist((h) => (h ? { ...h, bannerUrl: data.url } : null));
      toast.success("Banner uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingBanner(false);
    }
  };

  if (loading) {
    return (
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
        <div className="container mx-auto py-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading portfolio...</p>
        </div>
      </main>
    );
  }

  if (error || !hairstylist) {
    return (
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
        <div className="container mx-auto py-12 text-center">
          <p className="text-destructive mb-4 text-lg">{error || "Hairstylist not found"}</p>
          <Link href="/hairstylists" className="inline-flex items-center gap-2 px-6 py-3 border border-primary hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Hairstylists
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background relative">
      {hairstylist.bannerUrl && (
        <div className="fixed inset-0 -z-10 w-full h-full">
          <Image
            src={normalizeImagePath(hairstylist.bannerUrl)}
            alt=""
            fill
            className="object-cover opacity-10 blur-[20px] scale-110"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-background/80" />
        </div>
      )}

      <div className="container mx-auto pt-8 px-4 relative z-0">
        <div className="flex items-center justify-between mb-8">
          <Link href="/hairstylists" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Hairstylists
          </Link>
          {isAdmin && (
            <div className="flex items-center gap-3">
              <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Portfolio
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Hairstylist Portfolio</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea value={editForm.bio} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))} rows={4} />
                    </div>
                    <div className="space-y-2">
                      <Label>Specialties</Label>
                      <Input value={editForm.specialties} onChange={(e) => setEditForm((f) => ({ ...f, specialties: e.target.value }))} placeholder="e.g. Cuts, Color, Bridal" />
                    </div>
                    <div className="space-y-2">
                      <Label>Portfolio URL</Label>
                      <Input type="url" value={editForm.portfolioUrl} onChange={(e) => setEditForm((f) => ({ ...f, portfolioUrl: e.target.value }))} placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Avatar</Label>
                      <div className="flex items-center gap-2">
                        <input type="file" accept="image/*" className="hidden" id="hs-avatar" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                        <label htmlFor="hs-avatar" className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm">
                          {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploadingAvatar ? "Uploading..." : "Upload avatar"}
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Banner</Label>
                      <div className="flex items-center gap-2">
                        <input type="file" accept="image/*" className="hidden" id="hs-banner" onChange={handleBannerUpload} disabled={uploadingBanner} />
                        <label htmlFor="hs-banner" className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm">
                          {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploadingBanner ? "Uploading..." : "Upload banner"}
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete hairstylist?</AlertDialogTitle>
                    <AlertDialogDescription>This will remove the hairstylist and all their portfolio works. This cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground" disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Hero */}
        <div className="mb-12">
          <div className="relative w-full h-48 sm:h-64 md:h-80 rounded-xl overflow-hidden bg-secondary mb-6">
            {hairstylist.bannerUrl ? (
              <Image src={normalizeImagePath(hairstylist.bannerUrl)} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Briefcase className="w-20 h-20 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-6 -mt-16 sm:-mt-20 relative z-10 px-4">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-background bg-secondary flex-shrink-0">
              {hairstylist.avatarUrl ? (
                <Image src={normalizeImagePath(hairstylist.avatarUrl)} alt={hairstylist.name} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Scissors className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="pt-2">
              <h1 className="text-3xl md:text-4xl font-semibold mb-2">{hairstylist.name}</h1>
              {hairstylist.specialties && (
                <p className="text-muted-foreground mb-2 font-bold">{hairstylist.specialties}</p>
              )}
              {hairstylist.bio && <p className="text-muted-foreground max-w-2xl italic">{hairstylist.bio}</p>}
            </div>
          </div>
        </div>

        {/* Works */}
        <section className="py-8">
          <h2 className="text-2xl font-semibold mb-6">Portfolio</h2>
          {works.length === 0 ? (
            <p className="text-muted-foreground">No portfolio pieces yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {works.map((work) => (
                <div key={work.id} className="bg-card border border-border rounded-lg overflow-hidden">
                  {work.imageUrl ? (
                    <div className="relative aspect-[4/3] bg-secondary">
                      <Image src={normalizeImagePath(work.imageUrl)} alt={work.title} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
                      <Briefcase className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium mb-1">{work.title}</h3>
                    {work.category && <p className="text-sm text-muted-foreground">{work.category}</p>}
                    {work.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{work.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
