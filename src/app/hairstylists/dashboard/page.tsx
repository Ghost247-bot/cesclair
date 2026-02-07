"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInactivityLogout } from "@/lib/hooks/useInactivityLogout";
import Link from "next/link";
import Image from "next/image";
import {
  Scissors,
  LogOut,
  Loader2,
  Edit,
  Plus,
  Trash2,
  ExternalLink,
  Briefcase,
  User,
  Upload,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { normalizeImagePath } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Hairstylist {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  portfolioUrl: string | null;
  specialties: string | null;
  status: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Work {
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

interface Contract {
  id: number;
  title: string;
  description: string | null;
  amount: string | null;
  status: string;
  awardedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  contractFileUrl: string | null;
}

export default function HairstylistDashboardPage() {
  const router = useRouter();
  const [hairstylist, setHairstylist] = useState<Hairstylist | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    bio: "",
    portfolioUrl: "",
    specialties: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [workForm, setWorkForm] = useState({
    title: "",
    description: "",
    category: "",
    imageUrl: "",
    status: "published",
  });
  const [savingWork, setSavingWork] = useState(false);
  const [uploadingWorkImage, setUploadingWorkImage] = useState(false);

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/hairstylists/me", { credentials: "include" });
      if (!meRes.ok) {
        router.push("/hairstylists/login");
        return;
      }
      const me = await meRes.json();
      setHairstylist(me);
      setProfileForm({
        name: me.name || "",
        bio: me.bio || "",
        portfolioUrl: me.portfolioUrl || "",
        specialties: me.specialties || "",
      });

      const [worksRes, contractsRes] = await Promise.all([
        fetch(`/api/hairstylist-works?hairstylistId=${me.id}&limit=100`, { credentials: "include" }),
        fetch("/api/hairstylists/contracts", { credentials: "include" }),
      ]);
      if (worksRes.ok) {
        const list = await worksRes.json();
        setWorks(list);
      }
      if (contractsRes.ok) {
        const list = await contractsRes.json();
        setContracts(list);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const hairstylistLogout = async () => {
    await fetch("/api/hairstylists/logout", { method: "POST", credentials: "include" });
  };

  // Auto logout after 5 minutes of inactivity; ends session and redirects to login
  useInactivityLogout({
    redirectTo: "/hairstylists/login",
    onLogout: hairstylistLogout,
    enabled: !!hairstylist,
  });

  const handleLogout = () => {
    router.push("/hairstylists/login");
    hairstylistLogout(); // end session in background
  };

  const handleSaveProfile = async () => {
    if (!hairstylist) return;
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/hairstylists/${hairstylist.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update");
      const updated = await res.json();
      setHairstylist(updated);
      setShowProfileModal(false);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSavingProfile(false);
    }
  };

  const openAddWork = () => {
    setEditingWork(null);
    setWorkForm({
      title: "",
      description: "",
      category: "",
      imageUrl: "",
      status: "published",
    });
    setShowWorkModal(true);
  };

  const openEditWork = (work: Work) => {
    setEditingWork(work);
    setWorkForm({
      title: work.title,
      description: work.description || "",
      category: work.category || "",
      imageUrl: work.imageUrl || "",
      status: work.status === "draft" ? "draft" : "published",
    });
    setShowWorkModal(true);
  };

  const handleSaveWork = async () => {
    if (!hairstylist || !workForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSavingWork(true);
    try {
      if (editingWork) {
        const res = await fetch(`/api/hairstylist-works/${editingWork.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: workForm.title.trim(),
            description: workForm.description.trim() || null,
            category: workForm.category.trim() || null,
            imageUrl: workForm.imageUrl.trim() || null,
            status: workForm.status,
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Failed to update");
        const updated = await res.json();
        setWorks((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
        toast.success("Work updated");
      } else {
        const res = await fetch("/api/hairstylist-works", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            hairstylistId: hairstylist.id,
            title: workForm.title.trim(),
            description: workForm.description.trim() || null,
            category: workForm.category.trim() || null,
            imageUrl: workForm.imageUrl.trim() || null,
            status: workForm.status,
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Failed to add");
        const created = await res.json();
        setWorks((prev) => [created, ...prev]);
        toast.success("Work added");
      }
      setShowWorkModal(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingWork(false);
    }
  };

  const handleWorkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingWorkImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/design", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      if (data.url) {
        setWorkForm((f) => ({ ...f, imageUrl: data.url }));
        toast.success("Image uploaded");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to upload image");
    } finally {
      setUploadingWorkImage(false);
      e.target.value = "";
    }
  };

  const handleDeleteWork = async (id: number) => {
    if (!confirm("Delete this portfolio piece?")) return;
    try {
      const res = await fetch(`/api/hairstylist-works/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setWorks((prev) => prev.filter((w) => w.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <main className="pt-[60px] min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </main>
    );
  }

  if (!hairstylist) {
    return null;
  }

  const publishedWorks = works.filter((w) => w.status !== "draft");

  return (
    <main className="pt-[60px] min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-semibold">Hairstylist Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link
              href={`/hairstylists/${hairstylist.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View my portfolio
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                {hairstylist.avatarUrl ? (
                  <Image
                    src={normalizeImagePath(hairstylist.avatarUrl)}
                    alt={hairstylist.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Scissors className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold">{hairstylist.name}</h2>
                <p className="text-sm text-muted-foreground">{hairstylist.email}</p>
                {hairstylist.specialties && (
                  <p className="text-sm mt-2 font-bold">{hairstylist.specialties}</p>
                )}
                {hairstylist.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3 italic">{hairstylist.bio}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowProfileModal(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit profile
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <span className="font-medium">Portfolio</span>
            </div>
            <p className="text-3xl font-semibold">{publishedWorks.length}</p>
            <p className="text-sm text-muted-foreground">published pieces</p>
            <Button
              className="mt-4 w-full"
              size="sm"
              onClick={openAddWork}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add work
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium">Contracts</span>
            </div>
            <p className="text-3xl font-semibold">{contracts.length}</p>
            <p className="text-sm text-muted-foreground">assigned by Cesworld</p>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-4">My portfolio works</h2>
          {works.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No portfolio pieces yet.</p>
              <Button className="mt-4" onClick={openAddWork}>
                <Plus className="w-4 h-4 mr-2" />
                Add your first work
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {works.map((work) => (
                <div
                  key={work.id}
                  className="bg-card border border-border rounded-lg overflow-hidden group"
                >
                  <div className="relative aspect-[4/3] bg-secondary">
                    {work.imageUrl ? (
                      <Image
                        src={normalizeImagePath(work.imageUrl)}
                        alt={work.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium truncate">{work.title}</h3>
                    {work.category && (
                      <p className="text-xs text-muted-foreground">{work.category}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditWork(work)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteWork(work.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-4">My contracts</h2>
          {contracts.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No contracts yet.</p>
              <p className="text-sm mt-1">Contracts Assigned by Cesworld will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{contract.title}</h3>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            contract.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : contract.status === "awarded"
                                ? "bg-blue-100 text-blue-700"
                                : contract.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {contract.status.toUpperCase()}
                        </span>
                      </div>
                      {contract.description && (
                        <p className="text-sm text-muted-foreground mb-2">{contract.description}</p>
                      )}
                      {contract.amount && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Amount:</strong> ${contract.amount}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(contract.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {contract.contractFileUrl && (
                      <a
                        href={contract.contractFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Document
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Name</Label>
              <Input
                value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label>Specialties</Label>
              <Input
                value={profileForm.specialties}
                onChange={(e) => setProfileForm((f) => ({ ...f, specialties: e.target.value }))}
                placeholder="e.g. Cuts, Color, Bridal"
              />
            </div>
            <div>
              <Label>Portfolio URL</Label>
              <Input
                type="url"
                value={profileForm.portfolioUrl}
                onChange={(e) => setProfileForm((f) => ({ ...f, portfolioUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowProfileModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWorkModal} onOpenChange={setShowWorkModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingWork ? "Edit work" : "Add portfolio work"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={workForm.title}
                onChange={(e) => setWorkForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Summer highlights"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={workForm.description}
                onChange={(e) => setWorkForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={workForm.category}
                onChange={(e) => setWorkForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Color, Bridal"
              />
            </div>
            <div>
              <Label>Image</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="url"
                  value={workForm.imageUrl}
                  onChange={(e) => setWorkForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://... or upload below"
                  className="flex-1"
                />
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  className="hidden"
                  id="work-image-upload"
                  onChange={handleWorkImageUpload}
                  disabled={uploadingWorkImage}
                />
                <label
                  htmlFor="work-image-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors ${uploadingWorkImage ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {uploadingWorkImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploadingWorkImage ? "Uploading..." : "Upload"}
                </label>
              </div>
              {workForm.imageUrl && (
                <div className="relative mt-2 w-24 h-24 rounded-lg overflow-hidden bg-secondary border border-border">
                  <Image
                    src={normalizeImagePath(workForm.imageUrl)}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={workForm.status}
                onChange={(e) => setWorkForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowWorkModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWork} disabled={savingWork || !workForm.title.trim()}>
              {savingWork ? "Saving..." : editingWork ? "Update" : "Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
