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
  ImageIcon,
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
import CautionBanners from "@/components/caution-banner";

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
  const [showContractsModal, setShowContractsModal] = useState(false);

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
    <main className="min-h-screen bg-white pt-[60px] md:pt-[64px]">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-light text-gray-900 tracking-wide">
              Hairstylist Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <Link
                href={`/hairstylists/${hairstylist.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-serif">View Portfolio</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-serif">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Caution Banners */}
      <CautionBanners />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Profile Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
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
                    <Scissors className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl md:text-3xl font-serif font-light text-gray-900 mb-2">
                  {hairstylist.name}
                </h2>
                <p className="text-gray-600 font-serif italic">{hairstylist.email}</p>
                {hairstylist.specialties && (
                  <p className="text-gray-700 font-serif mt-2">{hairstylist.specialties}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-2xl font-serif font-light text-gray-900 mb-1">
                {works.length}
              </div>
              <p className="text-gray-600 font-serif">Portfolio Pieces</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-2xl font-serif font-light text-gray-900 mb-1">
                {contracts.length}
              </div>
              <p className="text-gray-600 font-serif">Active Contracts</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-2xl font-serif font-light text-gray-900 mb-1">
                {publishedWorks.length}
              </div>
              <p className="text-gray-600 font-serif">Published Works</p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {hairstylist.bio && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-12">
            <h3 className="text-xl font-serif font-light text-gray-900 mb-4">About</h3>
            <p className="text-gray-700 leading-relaxed font-serif italic">
              "{hairstylist.bio}"
            </p>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-12">
          <h3 className="text-xl font-serif font-light text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-serif w-20">Email:</span>
              <span className="text-gray-900 font-serif">{hairstylist.email}</span>
            </div>
            {hairstylist.portfolioUrl && (
              <div className="flex items-center gap-3">
                <span className="text-gray-600 font-serif w-20">Portfolio:</span>
                <a
                  href={hairstylist.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-serif underline"
                >
                  {hairstylist.portfolioUrl}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-12">
          <button
            onClick={() => setShowProfileModal(true)}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-serif tracking-wide"
          >
            Edit Profile
          </button>
          <button
            onClick={openAddWork}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-serif tracking-wide"
          >
            Add Work
          </button>
          <button
            onClick={() => setShowContractsModal(true)}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-serif tracking-wide"
          >
            Contracts
          </button>
        </div>

        {/* Works Grid */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-serif font-light text-gray-900 mb-8">
            Portfolio Gallery
          </h2>
          
          {works.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-serif font-light text-gray-900 mb-4">
                No Portfolio Yet
              </h3>
              <p className="text-gray-600 font-serif">
                Start building your portfolio by adding your best work
              </p>
              <button
                onClick={openAddWork}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-serif tracking-wide"
              >
                Add Your First Work
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {works.map((work) => (
                <div
                  key={work.id}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Work Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {work.imageUrl ? (
                      <Image
                        src={normalizeImagePath(work.imageUrl)}
                        alt={work.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Work Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-serif font-light text-gray-900 mb-2">
                          {work.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-serif">
                          {work.category}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditWork(work)}
                          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWork(work.id)}
                          className="p-2 text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contracts Section */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-serif font-light text-gray-900 mb-8">
            Contracts
          </h2>
          
          {contracts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-serif font-light text-gray-900 mb-4">
                No Contracts Yet
              </h3>
              <p className="text-gray-600 font-serif">
                Your contracts will appear here once they are assigned
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-serif font-light text-gray-900 mb-2">
                        {contract.title}
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          contract.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : contract.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {contract.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {contract.description && (
                    <p className="text-sm text-gray-600 mb-2">{contract.description}</p>
                  )}
                  {contract.amount && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Amount:</strong> ${contract.amount}
                    </p>
                  )}
                  {contract.contractFileUrl && (
                    <a
                      href={contract.contractFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Document
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
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

      {/* Work Modal */}
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
                  className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors ${
                    uploadingWorkImage ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
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
                <div className="relative mt-2 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
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

      {/* Contracts Modal */}
      <Dialog open={showContractsModal} onOpenChange={setShowContractsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contracts</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {contracts.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-light text-gray-900 mb-4">
                  No Contracts Yet
                </h3>
                <p className="text-gray-600">
                  Your contracts will appear here once they are assigned
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-serif font-light text-gray-900">
                          {contract.title}
                        </h4>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            contract.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : contract.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {contract.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {contract.description && (
                      <p className="text-sm text-gray-600 mb-3">{contract.description}</p>
                    )}
                    {contract.amount && (
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Amount:</strong> ${contract.amount}
                      </p>
                    )}
                    {contract.contractFileUrl && (
                      <a
                        href={contract.contractFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Document
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={() => setShowContractsModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
