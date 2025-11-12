"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Users, Briefcase, Mail, Calendar, Tag, Edit, Trash2, Loader2, Upload, X } from "lucide-react";
import Footer from "@/components/sections/footer";
import { useSession } from "@/lib/auth-client";
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

interface Designer {
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

interface Design {
  id: number;
  designerId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function DesignerPortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const designerId = params?.id as string;
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [designer, setDesigner] = useState<Designer | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageBasket, setImageBasket] = useState<Array<{ id: string; url: string; file?: File; preview?: string }>>([]);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [bannerImageError, setBannerImageError] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    bio: "",
    portfolioUrl: "",
    specialties: "",
    avatarUrl: "",
    bannerUrl: "",
    status: "",
  });

  useEffect(() => {
    async function fetchDesignerData() {
      if (!designerId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch designer information
        const designerResponse = await fetch(`/api/designers/${designerId}`);
        if (!designerResponse.ok) {
          if (designerResponse.status === 404) {
            throw new Error("Designer not found");
          }
          throw new Error("Failed to fetch designer");
        }
        const designerData = await designerResponse.json();
        console.log('Designer data received:', { 
          id: designerData.id, 
          name: designerData.name, 
          avatarUrl: designerData.avatarUrl,
          hasAvatarUrl: !!designerData.avatarUrl,
          bannerUrl: designerData.bannerUrl,
          hasBannerUrl: !!designerData.bannerUrl
        });
        setDesigner(designerData);
        setAvatarImageError(false); // Reset error state when new designer is loaded
        setBannerImageError(false); // Reset banner error state
        
        // Initialize edit form
        setEditForm({
          name: designerData.name || "",
          email: designerData.email || "",
          bio: designerData.bio || "",
          portfolioUrl: designerData.portfolioUrl || "",
          specialties: designerData.specialties || "",
          avatarUrl: designerData.avatarUrl || "",
          bannerUrl: designerData.bannerUrl || "",
          status: designerData.status || "",
        });
        
        // Set banner preview if banner exists
        if (designerData.bannerUrl) {
          setBannerPreview(designerData.bannerUrl);
        }
        
        // Set avatar preview if avatar exists
        if (designerData.avatarUrl) {
          setAvatarPreview(designerData.avatarUrl);
        }

        // Only show approved designers (unless admin)
        if (designerData.status !== "approved" && !isAdmin) {
          setError("This designer portfolio is not available.");
          setLoading(false);
          return;
        }

        // Fetch designer's designs (show all non-draft designs for portfolio)
        const designsResponse = await fetch(
          `/api/designs?designerId=${designerId}&limit=50`
        );
        if (designsResponse.ok) {
          const designsData = await designsResponse.json();
          // Filter to only show non-draft designs (published, approved, etc.)
          const publicDesigns = designsData.filter(
            (d: Design) => d.status !== "draft"
          );
          setDesigns(publicDesigns);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchDesignerData();
  }, [designerId, isAdmin]);

  const handleEdit = async () => {
    if (!designer) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/designers/${designer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update portfolio");
      }

      const updatedDesigner = await response.json();
      setDesigner(updatedDesigner);
      setShowEditModal(false);
      toast.success("Portfolio updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update portfolio");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!designer) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/designers/${designer.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete designer");
      }

      toast.success("Designer deleted successfully");
      router.push("/designers");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete designer");
      setIsDeleting(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    try {
      setUploadingBanner(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/banner', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
      setBannerFile(file);
      
      // Update the bannerUrl in the form
      setEditForm({ ...editForm, bannerUrl: data.url });

      toast.success('Banner image uploaded successfully');
      return data.url;
    } catch (error) {
      console.error('Banner upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload banner');
      throw error;
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleBannerUpload(file);
    }
  };

  const removeBannerPreview = () => {
    setBannerPreview(null);
    setBannerFile(null);
    setEditForm({ ...editForm, bannerUrl: "" });
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setAvatarFile(file);
      
      // Update the avatarUrl in the form
      setEditForm({ ...editForm, avatarUrl: data.url });

      toast.success('Avatar image uploaded successfully');
      return data.url;
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const removeAvatarPreview = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setEditForm({ ...editForm, avatarUrl: "" });
  };

  const handleImageBasketUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return allowedTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validFiles.length === 0) {
      toast.error('No valid images selected. Please select JPEG, PNG, WebP, or GIF images under 10MB.');
      return;
    }

    setUploadingImages(true);
    const uploadedImages: Array<{ id: string; url: string; file?: File; preview?: string }> = [];

    try {
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/design', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const previewUrl = URL.createObjectURL(file);
          uploadedImages.push({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            url: data.url,
            file: file,
            preview: previewUrl,
          });
        } else {
          const error = await response.json();
          toast.error(`Failed to upload ${file.name}: ${error.error || 'Upload failed'}`);
        }
      }

      if (uploadedImages.length > 0) {
        setImageBasket(prev => [...prev, ...uploadedImages]);
        toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Image basket upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageBasketFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageBasketUpload(files);
    }
  };

  const removeImageFromBasket = (id: string) => {
    setImageBasket(prev => {
      const image = prev.find(img => img.id === id);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  if (loading) {
    return (
      <>
        <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
          <div className="container mx-auto py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading portfolio...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !designer) {
    return (
      <>
        <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
          <div className="container mx-auto py-12">
            <div className="text-center">
              <p className="text-destructive mb-4 text-lg">
                {error || "Designer not found"}
              </p>
              <Link
                href="/designers"
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Designers</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background relative">
        {/* Background Image */}
        {designer.bannerUrl && (
          <div className="fixed inset-0 -z-10 w-full h-full">
            <Image
              src={designer.bannerUrl}
              alt={`${designer.name} background`}
              fill
              className="object-cover opacity-10"
              style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-background/80" />
          </div>
        )}
        
        {/* Back Button and Admin Controls */}
        <div className="container mx-auto pt-8 px-4 relative z-0">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/designers"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Designers</span>
            </Link>
            
            {isAdmin && designer && (
              <div className="flex items-center gap-3">
                <Dialog 
                  open={showEditModal} 
                  onOpenChange={(open) => {
                    setShowEditModal(open);
                    if (!open) {
                      // Reset banner preview when modal closes
                      if (designer?.bannerUrl) {
                        setBannerPreview(designer.bannerUrl);
                      } else {
                        setBannerPreview(null);
                      }
                      setBannerFile(null);
                      
                      // Reset avatar preview when modal closes
                      if (designer?.avatarUrl) {
                        setAvatarPreview(designer.avatarUrl);
                      } else {
                        setAvatarPreview(null);
                      }
                      setAvatarFile(null);
                      
                      // Reset image basket when modal closes
                      imageBasket.forEach(img => {
                        if (img.preview) {
                          URL.revokeObjectURL(img.preview);
                        }
                      });
                      setImageBasket([]);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Portfolio
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Designer Portfolio</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) =>
                            setEditForm({ ...editForm, bio: e.target.value })
                          }
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialties">Specialties</Label>
                        <Input
                          id="specialties"
                          value={editForm.specialties}
                          onChange={(e) =>
                            setEditForm({ ...editForm, specialties: e.target.value })
                          }
                          placeholder="e.g., Fashion Design, Textile Design"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                        <Input
                          id="portfolioUrl"
                          type="url"
                          value={editForm.portfolioUrl}
                          onChange={(e) =>
                            setEditForm({ ...editForm, portfolioUrl: e.target.value })
                          }
                          placeholder="https://example.com/portfolio"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avatarUrl">Avatar Image</Label>
                        <div className="space-y-3">
                          {/* Avatar Preview */}
                          {(avatarPreview || editForm.avatarUrl) && (
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mx-auto">
                              {avatarPreview?.startsWith('blob:') ? (
                                <img
                                  src={avatarPreview}
                                  alt="Avatar preview"
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <Image
                                  src={avatarPreview || editForm.avatarUrl || ''}
                                  alt="Avatar preview"
                                  fill
                                  className="object-cover rounded-full"
                                  sizes="128px"
                                  unoptimized={!avatarPreview && editForm.avatarUrl?.startsWith('http')}
                                />
                              )}
                              <button
                                type="button"
                                onClick={removeAvatarPreview}
                                className="absolute top-0 right-0 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors z-10"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          
                          {/* File Upload */}
                          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                              onChange={handleAvatarFileChange}
                              className="hidden"
                              id="avatar-file-upload"
                              disabled={uploadingAvatar}
                            />
                            <label
                              htmlFor="avatar-file-upload"
                              className={`cursor-pointer inline-flex flex-col items-center gap-2 ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {uploadingAvatar ? (
                                <>
                                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                  <span className="text-sm text-muted-foreground">Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    Click to upload avatar image or drag and drop
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    PNG, JPG, WebP, GIF (max 5MB)
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bannerUrl">Hero Banner Image</Label>
                        <div className="space-y-3">
                          {/* Banner Preview */}
                          {(bannerPreview || editForm.bannerUrl) && (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                              {bannerPreview?.startsWith('blob:') ? (
                                <img
                                  src={bannerPreview}
                                  alt="Banner preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image
                                  src={bannerPreview || editForm.bannerUrl || ''}
                                  alt="Banner preview"
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 768px"
                                  unoptimized={!bannerPreview && editForm.bannerUrl?.startsWith('http')}
                                />
                              )}
                              <button
                                type="button"
                                onClick={removeBannerPreview}
                                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors z-10"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          
                          {/* File Upload */}
                          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                              onChange={handleBannerFileChange}
                              className="hidden"
                              id="banner-file-upload"
                              disabled={uploadingBanner}
                            />
                            <label
                              htmlFor="banner-file-upload"
                              className={`cursor-pointer inline-flex flex-col items-center gap-2 ${uploadingBanner ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {uploadingBanner ? (
                                <>
                                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                  <span className="text-sm text-muted-foreground">Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    Click to upload banner image or drag and drop
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    JPEG, PNG, WebP, GIF up to 10MB
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                          
                          {/* Or use URL */}
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-border"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-white px-2 text-muted-foreground">Or</span>
                            </div>
                          </div>
                          
                          <Input
                            id="bannerUrl"
                            type="url"
                            value={editForm.bannerUrl}
                            onChange={(e) =>
                              setEditForm({ ...editForm, bannerUrl: e.target.value })
                            }
                            placeholder="https://example.com/banner.jpg"
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter a URL for the hero banner image
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Portfolio Images Basket</Label>
                        <div className="space-y-3">
                          {/* Image Basket Grid */}
                          {imageBasket.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                              {imageBasket.map((image) => (
                                <div
                                  key={image.id}
                                  className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                                >
                                  <img
                                    src={image.preview || image.url}
                                    alt="Portfolio image"
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImageFromBasket(image.id)}
                                    className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* File Upload */}
                          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                              onChange={handleImageBasketFileChange}
                              className="hidden"
                              id="image-basket-upload"
                              multiple
                              disabled={uploadingImages}
                            />
                            <label
                              htmlFor="image-basket-upload"
                              className={`cursor-pointer inline-flex flex-col items-center gap-2 ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {uploadingImages ? (
                                <>
                                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                  <span className="text-sm text-muted-foreground">Uploading images...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    Click to upload images or drag and drop
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    PNG, JPG, WebP, GIF (max 10MB each) - Multiple images allowed
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                          {imageBasket.length > 0 && (
                            <p className="text-xs text-muted-foreground text-center">
                              {imageBasket.length} image(s) in basket
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                          id="status"
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({ ...editForm, status: e.target.value })
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowEditModal(false)}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleEdit} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the designer portfolio for{" "}
                        <strong>{designer.name}</strong>. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>

        {/* Hero Section with Banner */}
        <section className="relative z-0">
          {designer.bannerUrl && !bannerImageError ? (
            <div className="relative w-full h-64 md:h-96 bg-secondary overflow-hidden">
              <Image
                src={designer.bannerUrl}
                alt={`${designer.name} banner`}
                fill
                className="object-cover"
                sizes="100vw"
                priority
                unoptimized={designer.bannerUrl?.startsWith('http') && !designer.bannerUrl?.includes('supabase.co') && !designer.bannerUrl?.includes('localhost')}
                onError={() => {
                  console.error('Banner image failed to load:', designer.bannerUrl);
                  setBannerImageError(true);
                }}
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          ) : (
            <div className="w-full h-64 md:h-96 bg-gradient-to-br from-secondary to-accent-background" />
          )}

          {/* Designer Info Card */}
          <div className="container mx-auto px-4 -mt-24 md:-mt-32 relative z-10">
            <div className="bg-white border border-border shadow-lg p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 border-4 border-white rounded-full bg-white shadow-md overflow-hidden">
                    {designer.avatarUrl && !avatarImageError ? (
                      <Image
                        src={designer.avatarUrl}
                        alt={designer.name}
                        fill
                        className="object-cover rounded-full"
                        sizes="(max-width: 768px) 128px, 160px"
                        unoptimized={designer.avatarUrl?.startsWith('http') && !designer.avatarUrl?.includes('supabase.co') && !designer.avatarUrl?.includes('localhost')}
                        onError={() => {
                          console.error('Avatar image failed to load:', designer.avatarUrl);
                          setAvatarImageError(true);
                        }}
                        onLoad={() => setAvatarImageError(false)}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center">
                        <Users className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Designer Details */}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-medium mb-4">
                    {designer.name}
                  </h1>

                  {designer.specialties && (
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <p className="text-body text-muted-foreground">
                        {designer.specialties}
                      </p>
                    </div>
                  )}

                  {designer.bio && (
                    <p className="text-body text-muted-foreground mb-6 leading-relaxed">
                      {designer.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{designer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Joined{" "}
                        {new Date(designer.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Designs Section */}
        <section className="py-16 md:py-24 relative z-0">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-medium">
                Portfolio Works
              </h2>
              {designs.length > 0 && (
                <span className="text-body text-muted-foreground">
                  {designs.length} {designs.length === 1 ? "design" : "designs"}
                </span>
              )}
            </div>

            {designs.length === 0 ? (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-body-large text-muted-foreground">
                  No published designs yet.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {designs.map((design) => (
                  <div
                    key={design.id}
                    className="bg-white border border-border overflow-hidden transition-all hover:shadow-lg hover:border-primary group"
                  >
                    {design.imageUrl ? (
                      <div className="relative w-full h-64 bg-secondary">
                        <Image
                          src={design.imageUrl}
                          alt={design.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-secondary to-accent-background flex items-center justify-center">
                        <Briefcase className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-xl font-medium mb-2">{design.title}</h3>
                      {design.description && (
                        <p className="text-body text-muted-foreground mb-4 line-clamp-3">
                          {design.description}
                        </p>
                      )}
                      {design.category && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          <span className="text-caption text-muted-foreground">
                            {design.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* External Portfolio Link (if exists) */}
        {designer.portfolioUrl && (
          <section className="py-16 bg-gradient-to-br from-accent to-accent-background relative z-0">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-medium mb-4">
                View Full Portfolio
              </h2>
              <p className="text-body-large text-muted-foreground mb-8 max-w-2xl mx-auto">
                Visit the designer's external portfolio to see more of their work.
              </p>
              <a
                href={designer.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <span className="text-button-primary">Visit Portfolio</span>
                <Briefcase className="w-4 h-4" />
              </a>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

