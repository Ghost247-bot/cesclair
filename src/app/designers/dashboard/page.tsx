"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  LogOut, 
  Plus,
  Edit,
  Trash2,
  FileSignature,
  Loader2,
  Upload,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Download,
  FolderOpen,
  ExternalLink
} from "lucide-react";
import Image from "next/image";
import Footer from "@/components/sections/footer";
import { SigningFrame } from "@/components/docusign/SigningFrame";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface Designer {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  portfolioUrl: string | null;
  specialties: string | null;
  status: string;
  avatarUrl: string | null;
}

interface Stats {
  totalDesigns: number;
  contractsAwarded: number;
  contractsCompleted: number;
}

interface Design {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  imageUrl: string | null;
  createdAt: string;
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
  envelopeId: string | null;
  envelopeStatus: string | null;
  signedAt: string | null;
}

interface Document {
  id: number;
  designerId: number;
  uploadedBy: string | null;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  fileType: string | null;
  category: string | null;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
  uploader?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function DesignerDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending, refetch } = useSession();
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "designs" | "contracts" | "documents">("overview");
  const [signingContract, setSigningContract] = useState<Contract | null>(null);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [designForm, setDesignForm] = useState({
    title: '',
    description: '',
    category: '',
    imageUrl: '',
    imageFile: null as File | null,
  });
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    title: '',
    description: '',
    category: '',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    fileType: '',
    file: null as File | null,
  });
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    bio: '',
    portfolioUrl: '',
    specialties: '',
  });
  const [hasCheckedDesigner, setHasCheckedDesigner] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Check authentication and role
  useEffect(() => {
    // Prevent multiple checks if already checked or if role is being updated
    if (sessionPending || isUpdatingRole || hasCheckedDesigner) {
      return;
    }

    if (!session?.user) {
      router.push("/designers/login");
      return;
    }

    const role = session.user.role || 'member';
    const userEmail = session.user.email;
    
    // Check if user is a designer (either by role or by designer status)
    if (role === 'designer') {
      // User has designer role, fetch designer data
      if (userEmail && !designer) {
        setHasCheckedDesigner(true);
        fetchDesignerByEmail(userEmail);
      }
      return;
    }
    
    // If user doesn't have designer role, check if they're an approved designer
    if (role !== 'designer') {
      if (role === 'admin') {
        router.push("/admin");
        return;
      }
      
      // Check if user is an approved designer
      if (userEmail && !designer) {
        setHasCheckedDesigner(true);
        checkDesignerStatus(userEmail);
        return;
      } else if (!userEmail) {
        router.push("/designers/login");
        return;
      }
    }
  }, [session, sessionPending, router, designer, hasCheckedDesigner, isUpdatingRole]);

  const checkDesignerStatus = async (email: string) => {
    try {
      // Check if user is an approved designer
      const response = await fetch("/api/designers/by-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const designerData = await response.json();
        if (designerData.status === 'approved') {
          // User is an approved designer, update role and allow access
          // Only update role if it's not already set to designer
          const currentRole = session?.user?.role || 'member';
          if (currentRole !== 'designer') {
            setIsUpdatingRole(true);
            try {
              const roleUpdateResponse = await fetch("/api/designers/update-role", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: 'include',
              });

              if (roleUpdateResponse.ok) {
                // Role updated, refetch session and fetch designer data
                await refetch();
                setIsUpdatingRole(false);
                setHasCheckedDesigner(false); // Reset to allow re-check after role update
                // fetchDesignerByEmail will be called by the useEffect after session updates
              } else {
                // Role update failed, but still allow access if approved
                setIsUpdatingRole(false);
                fetchDesignerByEmail(email);
              }
            } catch (roleUpdateError) {
              console.warn("Error updating role:", roleUpdateError);
              setIsUpdatingRole(false);
              // Still allow access if approved
              fetchDesignerByEmail(email);
            }
          } else {
            // Role already set, just fetch designer data
            fetchDesignerByEmail(email);
          }
        } else if (designerData.status === 'pending') {
          toast.error("Your designer account is pending approval. Please wait for admin approval.");
          router.push("/designers");
        } else {
          router.push("/designers/login");
        }
      } else {
        // Not a designer, redirect to login
        router.push("/designers/login");
      }
    } catch (error) {
      console.error("Error checking designer status:", error);
      router.push("/designers/login");
    }
  };

  const fetchDesignerByEmail = async (email: string) => {
    try {
      setLoading(true);
      // Fetch designer by email from API (using POST to avoid auth requirement)
      const response = await fetch(`/api/designers/by-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const designerData = await response.json();
        setDesigner(designerData);
        if (designerData.id) {
          fetchDashboardData(designerData.id);
        } else {
          setLoading(false);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to load designer profile" }));
        if (response.status === 403 && errorData.code === 'NOT_APPROVED') {
          toast.error("Your designer account is pending approval. Please wait for admin approval.");
          router.push("/designers");
        } else {
          toast.error(errorData.error || "Failed to load designer profile");
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch designer:", error);
      toast.error("Failed to load designer profile");
      setLoading(false);
    }
  };

  const fetchDashboardData = async (designerId: number) => {
    try {
      // Fetch stats
      const statsRes = await fetch(`/api/designers/dashboard/${designerId}`);
      const statsData = await statsRes.json();
      setStats(statsData.stats);

      // Fetch designs
      const designsRes = await fetch(`/api/designs/designer/${designerId}?limit=50`);
      const designsData = await designsRes.json();
      setDesigns(designsData);

      // Fetch contracts
      const contractsRes = await fetch(`/api/contracts/designer/${designerId}?limit=50`);
      const contractsData = await contractsRes.json();
      setContracts(contractsData);

      // Fetch documents
      const documentsRes = await fetch(`/api/documents/designer/${designerId}`);
      const documentsData = await documentsRes.json();
      setDocuments(documentsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/designers");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  const deleteDesign = async (designId: number) => {
    if (!confirm("Are you sure you want to delete this design?")) return;

    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDesigns(designs.filter((d) => d.id !== designId));
        if (designer) fetchDashboardData(designer.id);
      }
    } catch (error) {
      console.error("Failed to delete design:", error);
    }
  };

  const handleSignContract = (contract: Contract) => {
    setSigningContract(contract);
  };

  const handleSigningComplete = async () => {
    // Refresh contracts after signing
    if (designer) {
      await fetchDashboardData(designer.id);
    }
    setSigningContract(null);
  };

  const handleSigningError = (error: string) => {
    alert(`Signing error: ${error}`);
    setSigningContract(null);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/design', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setDesignForm(prev => ({ ...prev, imageUrl: data.url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesignForm(prev => ({ ...prev, imageFile: file }));
      handleImageUpload(file);
    }
  };

  const openDesignModal = (design?: Design) => {
    if (design) {
      setEditingDesign(design);
      setDesignForm({
        title: design.title,
        description: design.description || '',
        category: design.category || '',
        imageUrl: design.imageUrl || '',
        imageFile: null,
      });
    } else {
      setEditingDesign(null);
      setDesignForm({
        title: '',
        description: '',
        category: '',
        imageUrl: '',
        imageFile: null,
      });
    }
    setShowDesignModal(true);
  };

  const closeDesignModal = () => {
    setShowDesignModal(false);
    setEditingDesign(null);
    setDesignForm({
      title: '',
      description: '',
      category: '',
      imageUrl: '',
      imageFile: null,
    });
  };

  const handleSaveDesign = async () => {
    if (!designer) return;

    if (!designForm.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const url = editingDesign 
        ? `/api/designs/${editingDesign.id}`
        : '/api/designs';
      
      const method = editingDesign ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(editingDesign ? {} : { designerId: designer.id }),
          title: designForm.title.trim(),
          description: designForm.description.trim() || null,
          category: designForm.category.trim() || null,
          imageUrl: designForm.imageUrl || null,
          status: editingDesign ? undefined : 'draft', // New designs start as draft
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save design');
      }

      toast.success(editingDesign ? 'Design updated successfully' : 'Design created successfully');
      closeDesignModal();
      if (designer) {
        await fetchDashboardData(designer.id);
      }
    } catch (error) {
      console.error('Save design error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save design');
    }
  };

  const handleSubmitDesign = async (designId: number) => {
    if (!confirm('Submit this design for admin review? Once submitted, you cannot edit it.')) {
      return;
    }

    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'submitted',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit design');
      }

      toast.success('Design submitted for review');
      if (designer) {
        await fetchDashboardData(designer.id);
      }
    } catch (error) {
      console.error('Submit design error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit design');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'submitted':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDocumentUpload = async (file: File) => {
    try {
      setUploadingDocument(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setDocumentForm(prev => ({ 
        ...prev, 
        fileUrl: data.url,
        fileName: data.fileName,
        fileSize: data.size,
        fileType: data.type,
        file: file
      }));
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentForm(prev => ({ ...prev, file }));
      handleDocumentUpload(file);
    }
  };

  const openDocumentModal = () => {
    setDocumentForm({
      title: '',
      description: '',
      category: '',
      fileUrl: '',
      fileName: '',
      fileSize: 0,
      fileType: '',
      file: null,
    });
    setShowDocumentModal(true);
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setDocumentForm({
      title: '',
      description: '',
      category: '',
      fileUrl: '',
      fileName: '',
      fileSize: 0,
      fileType: '',
      file: null,
    });
  };

  const handleSaveDocument = async () => {
    if (!designer) return;

    if (!documentForm.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!documentForm.fileUrl) {
      toast.error('Please upload a file');
      return;
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designerId: designer.id,
          uploadedBy: null, // null means uploaded by designer
          title: documentForm.title.trim(),
          description: documentForm.description.trim() || null,
          category: documentForm.category.trim() || null,
          fileName: documentForm.fileName,
          fileUrl: documentForm.fileUrl,
          fileSize: documentForm.fileSize,
          fileType: documentForm.fileType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save document');
      }

      toast.success('Document uploaded successfully');
      closeDocumentModal();
      if (designer) {
        await fetchDashboardData(designer.id);
      }
    } catch (error) {
      console.error('Save document error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save document');
    }
  };

  const deleteDocument = async (documentId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDocuments(documents.filter((d) => d.id !== documentId));
        if (designer) fetchDashboardData(designer.id);
        toast.success('Document deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (sessionPending || loading || !designer) {
    return (
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <>
    <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
      {/* Header */}
      <section className="bg-secondary py-8 border-b border-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-medium mb-2">DESIGNER DASHBOARD</h1>
              <p className="text-body text-muted-foreground">Welcome back, {designer.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-6 py-3 border border-primary hover:bg-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-button-secondary">LOGOUT</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      {stats && (
        <section className="py-8 bg-white border-b border-border">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-secondary">
                <FileText className="w-8 h-8 mx-auto mb-3" />
                <div className="text-3xl font-medium mb-1">{stats.totalDesigns}</div>
                <div className="text-label text-muted-foreground">TOTAL DESIGNS</div>
              </div>
              <div className="text-center p-6 bg-secondary">
                <Briefcase className="w-8 h-8 mx-auto mb-3" />
                <div className="text-3xl font-medium mb-1">{stats.contractsAwarded}</div>
                <div className="text-label text-muted-foreground">CONTRACTS AWARDED</div>
              </div>
              <div className="text-center p-6 bg-secondary">
                <LayoutDashboard className="w-8 h-8 mx-auto mb-3" />
                <div className="text-3xl font-medium mb-1">{stats.contractsCompleted}</div>
                <div className="text-label text-muted-foreground">CONTRACTS COMPLETED</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <section className="py-8">
        <div className="container mx-auto">
          <div className="flex gap-4 border-b border-border mb-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 text-button-secondary border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab("designs")}
              className={`px-6 py-3 text-button-secondary border-b-2 transition-colors ${
                activeTab === "designs"
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              MY DESIGNS ({designs.length})
            </button>
            <button
              onClick={() => setActiveTab("contracts")}
              className={`px-6 py-3 text-button-secondary border-b-2 transition-colors ${
                activeTab === "contracts"
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              CONTRACTS ({contracts.length})
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-6 py-3 text-button-secondary border-b-2 transition-colors ${
                activeTab === "documents"
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              DOCUMENTS ({documents.length})
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-white border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium">PROFILE INFORMATION</h3>
                  <button
                    onClick={() => {
                      setProfileForm({
                        bio: designer.bio || '',
                        portfolioUrl: designer.portfolioUrl || '',
                        specialties: designer.specialties || '',
                      });
                      setShowEditProfileModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-button-secondary">EDIT PROFILE</span>
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-label text-muted-foreground">NAME:</span>
                    <p className="text-body">{designer.name}</p>
                  </div>
                  <div>
                    <span className="text-label text-muted-foreground">EMAIL:</span>
                    <p className="text-body">{designer.email}</p>
                  </div>
                  {designer.specialties && (
                    <div>
                      <span className="text-label text-muted-foreground">SPECIALTIES:</span>
                      <p className="text-body">{designer.specialties}</p>
                    </div>
                  )}
                  {designer.bio && (
                    <div>
                      <span className="text-label text-muted-foreground">BIO:</span>
                      <p className="text-body">{designer.bio}</p>
                    </div>
                  )}
                  {designer.portfolioUrl && (
                    <div>
                      <span className="text-label text-muted-foreground">PORTFOLIO WEBSITE:</span>
                      <p className="text-body">
                        <a
                          href={designer.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {designer.portfolioUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-label text-muted-foreground">STATUS:</span>
                    <p className="text-body">
                      <span className={`inline-block px-3 py-1 text-caption ${
                        designer.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {designer.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Modal */}
          {showEditProfileModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
                  <h3 className="text-2xl font-medium">EDIT PROFILE</h3>
                  <button
                    onClick={() => setShowEditProfileModal(false)}
                    className="p-2 hover:bg-secondary rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Bio */}
                  <div>
                    <label className="block text-label font-medium mb-2">Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Portfolio URL */}
                  <div>
                    <label className="block text-label font-medium mb-2">Portfolio Website</label>
                    <input
                      type="url"
                      value={profileForm.portfolioUrl}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                      className="w-full px-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://yourportfolio.com"
                    />
                    <p className="text-caption text-muted-foreground mt-1">
                      Enter your portfolio website URL
                    </p>
                  </div>

                  {/* Specialties */}
                  <div>
                    <label className="block text-label font-medium mb-2">Specialties</label>
                    <input
                      type="text"
                      value={profileForm.specialties}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, specialties: e.target.value }))}
                      className="w-full px-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Apparel Design, Accessories, Footwear"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-border">
                    <button
                      onClick={() => setShowEditProfileModal(false)}
                      className="flex-1 px-6 py-3 border border-border hover:bg-secondary transition-colors"
                    >
                      <span className="text-button-secondary">CANCEL</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (!designer) return;
                        
                        setUpdatingProfile(true);
                        try {
                          const response = await fetch(`/api/designers/${designer.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                              bio: profileForm.bio.trim() || null,
                              portfolioUrl: profileForm.portfolioUrl.trim() || null,
                              specialties: profileForm.specialties.trim() || null,
                            }),
                          });

                          if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.error || 'Failed to update profile');
                          }

                          const updated = await response.json();
                          setDesigner(prev => prev ? { ...prev, ...updated } : null);
                          toast.success('Profile updated successfully');
                          setShowEditProfileModal(false);
                        } catch (error) {
                          console.error('Update profile error:', error);
                          toast.error(error instanceof Error ? error.message : 'Failed to update profile');
                        } finally {
                          setUpdatingProfile(false);
                        }
                      }}
                      disabled={updatingProfile}
                      className="flex-1 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-button-primary">
                        {updatingProfile ? 'UPDATING...' : 'UPDATE PROFILE'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Designs Tab */}
          {activeTab === "designs" && (
            <div className="space-y-6">
              {/* Add Design Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium">MY DESIGNS</h3>
                <button
                  onClick={() => openDesignModal()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-button-primary">UPLOAD DESIGN</span>
                </button>
              </div>

              {designs.length === 0 ? (
                <div className="text-center py-12 bg-white border border-border">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">You haven't created any designs yet.</p>
                  <button
                    onClick={() => openDesignModal()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-button-primary">UPLOAD YOUR FIRST DESIGN</span>
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {designs.map((design) => (
                    <div key={design.id} className="bg-white border border-border p-4 hover:shadow-lg transition-shadow">
                      {/* Design Image */}
                      {design.imageUrl && (
                        <div className="relative w-full h-48 mb-4 bg-secondary rounded overflow-hidden">
                          <Image
                            src={design.imageUrl}
                            alt={design.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-lg flex-1">{design.title}</h4>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        {getStatusIcon(design.status)}
                        <span className={`text-caption px-3 py-1 rounded border ${getStatusColor(design.status)}`}>
                          {design.status.toUpperCase()}
                        </span>
                      </div>

                      {design.description && (
                        <p className="text-body-small text-muted-foreground mb-3 line-clamp-2">
                          {design.description}
                        </p>
                      )}
                      
                      {design.category && (
                        <p className="text-caption text-muted-foreground mb-3">
                          <span className="font-medium">Category:</span> {design.category}
                        </p>
                      )}

                      <div className="text-caption text-muted-foreground mb-4">
                        Created: {new Date(design.createdAt).toLocaleDateString()}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {design.status === 'draft' && (
                          <>
                            <button
                              onClick={() => openDesignModal(design)}
                              className="flex-1 px-3 py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-colors text-body-small flex items-center justify-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleSubmitDesign(design.id)}
                              className="flex-1 px-3 py-2 bg-primary text-white hover:bg-primary/90 transition-colors text-body-small flex items-center justify-center gap-1"
                            >
                              <Send className="w-4 h-4" />
                              Submit
                            </button>
                          </>
                        )}
                        {(design.status === 'submitted' || design.status === 'approved' || design.status === 'rejected') && (
                          <div className="flex-1 px-3 py-2 text-body-small text-center text-muted-foreground">
                            {design.status === 'submitted' && 'Awaiting admin review'}
                            {design.status === 'approved' && 'Approved by admin'}
                            {design.status === 'rejected' && 'Declined by admin'}
                          </div>
                        )}
                        {design.status === 'draft' && (
                          <button
                            onClick={() => deleteDesign(design.id)}
                            className="px-3 py-2 border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors text-body-small"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Design Upload/Edit Modal */}
              {showDesignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
                      <h3 className="text-2xl font-medium">
                        {editingDesign ? 'EDIT DESIGN' : 'UPLOAD NEW DESIGN'}
                      </h3>
                      <button
                        onClick={closeDesignModal}
                        className="p-2 hover:bg-secondary rounded transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-label font-medium mb-2">
                          Title <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={designForm.title}
                          onChange={(e) => setDesignForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter design title"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-label font-medium mb-2">Description</label>
                        <textarea
                          value={designForm.description}
                          onChange={(e) => setDesignForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                          placeholder="Describe your design..."
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-label font-medium mb-2">Category</label>
                        <input
                          type="text"
                          value={designForm.category}
                          onChange={(e) => setDesignForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g., Apparel, Accessories, Footwear"
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="block text-label font-medium mb-2">Design Image</label>
                        {designForm.imageUrl ? (
                          <div className="space-y-2">
                            <div className="relative w-full h-64 bg-secondary rounded overflow-hidden">
                              <Image
                                src={designForm.imageUrl}
                                alt="Design preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              onClick={() => setDesignForm(prev => ({ ...prev, imageUrl: '', imageFile: null }))}
                              className="text-destructive text-body-small hover:underline"
                            >
                              Remove image
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-border rounded p-8 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="design-image-upload"
                              disabled={uploadingImage}
                            />
                            <label
                              htmlFor="design-image-upload"
                              className={`cursor-pointer inline-flex flex-col items-center gap-2 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {uploadingImage ? (
                                <>
                                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                  <span className="text-body-small text-muted-foreground">Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-muted-foreground" />
                                  <span className="text-body-small text-muted-foreground">
                                    Click to upload or drag and drop
                                  </span>
                                  <span className="text-caption text-muted-foreground">
                                    PNG, JPG, WEBP up to 10MB
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-4 border-t border-border">
                        <button
                          onClick={closeDesignModal}
                          className="flex-1 px-6 py-3 border border-border hover:bg-secondary transition-colors"
                        >
                          <span className="text-button-secondary">CANCEL</span>
                        </button>
                        <button
                          onClick={handleSaveDesign}
                          disabled={!designForm.title.trim() || uploadingImage}
                          className="flex-1 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-button-primary">
                            {editingDesign ? 'UPDATE DESIGN' : 'CREATE DESIGN'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contracts Tab */}
          {activeTab === "contracts" && (
            <div>
              {signingContract ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-medium">Sign Contract: {signingContract.title}</h3>
                    <button
                      onClick={() => setSigningContract(null)}
                      className="px-6 py-2 border border-border hover:bg-secondary transition-colors"
                    >
                      <span className="text-button-secondary">CANCEL</span>
                    </button>
                  </div>
                  <SigningFrame
                    contractId={signingContract.id}
                    envelopeId={signingContract.envelopeId || undefined}
                    signerEmail={designer!.email}
                    signerName={designer!.name}
                    contractTitle={signingContract.title}
                    contractDescription={signingContract.description || ""}
                    amount={signingContract.amount || "0"}
                    onSigningComplete={handleSigningComplete}
                    onError={handleSigningError}
                  />
                </div>
              ) : contracts.length === 0 ? (
                <div className="text-center py-12 bg-white border border-border">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">You don't have any contracts yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="bg-white border border-border p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg mb-1">{contract.title}</h4>
                          {contract.description && (
                            <p className="text-body-small text-muted-foreground">
                              {contract.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className={`text-caption px-3 py-1 whitespace-nowrap ${
                            contract.status === "completed" ? "bg-green-100 text-green-800" :
                            contract.status === "awarded" ? "bg-blue-100 text-blue-800" :
                            contract.status === "signed" ? "bg-purple-100 text-purple-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {contract.status.toUpperCase()}
                          </span>
                          {contract.envelopeStatus && (
                            <span className={`text-caption px-3 py-1 whitespace-nowrap ${
                              contract.envelopeStatus === "completed" ? "bg-green-100 text-green-800" :
                              contract.envelopeStatus === "sent" ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {contract.envelopeStatus.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-6 text-body-small text-muted-foreground mb-4">
                        {contract.amount && (
                          <div>
                            <span className="text-label">AMOUNT:</span> ${parseFloat(contract.amount).toFixed(2)}
                          </div>
                        )}
                        {contract.awardedAt && (
                          <div>
                            <span className="text-label">AWARDED:</span>{" "}
                            {new Date(contract.awardedAt).toLocaleDateString()}
                          </div>
                        )}
                        {contract.signedAt && (
                          <div>
                            <span className="text-label">SIGNED:</span>{" "}
                            {new Date(contract.signedAt).toLocaleDateString()}
                          </div>
                        )}
                        {contract.completedAt && (
                          <div>
                            <span className="text-label">COMPLETED:</span>{" "}
                            {new Date(contract.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      {/* Sign Contract Button */}
                      {contract.status === "awarded" && contract.envelopeStatus !== "completed" && (
                        <button
                          onClick={() => handleSignContract(contract)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
                        >
                          <FileSignature className="w-4 h-4" />
                          <span className="text-button-primary">SIGN CONTRACT</span>
                        </button>
                      )}
                      
                      {contract.envelopeStatus === "completed" && (
                        <div className="flex items-center gap-2 text-green-600">
                          <FileSignature className="w-4 h-4" />
                          <span className="text-body-small font-medium">Contract Signed Successfully</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              {/* Add Document Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium">MY DOCUMENTS</h3>
                <button
                  onClick={openDocumentModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-button-primary">UPLOAD DOCUMENT</span>
                </button>
              </div>

              {/* Documents from Admin */}
              {documents.filter(d => d.uploadedBy !== null).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Documents from Admin
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {documents.filter(d => d.uploadedBy !== null).map((document) => (
                      <div key={document.id} className="bg-white border border-border p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-lg mb-1">{document.title}</h4>
                            {document.description && (
                              <p className="text-body-small text-muted-foreground mb-2 line-clamp-2">
                                {document.description}
                              </p>
                            )}
                            {document.uploader && (
                              <p className="text-caption text-muted-foreground">
                                Uploaded by: {document.uploader.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-body-small text-muted-foreground mb-3">
                          <div>
                            <span className="font-medium">File:</span> {document.fileName}
                          </div>
                          <div>
                            {formatFileSize(document.fileSize)}
                          </div>
                        </div>
                        {document.category && (
                          <div className="mb-3">
                            <span className="text-caption px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {document.category}
                            </span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <a
                            href={document.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 bg-primary text-white hover:bg-primary/90 transition-colors text-body-small flex items-center justify-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </div>
                        <div className="text-caption text-muted-foreground mt-2">
                          Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* My Documents */}
              <div>
                <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  My Uploaded Documents
                </h4>
                {documents.filter(d => d.uploadedBy === null).length === 0 ? (
                  <div className="text-center py-12 bg-white border border-border">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">You haven't uploaded any documents yet.</p>
                    <button
                      onClick={openDocumentModal}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-button-primary">UPLOAD YOUR FIRST DOCUMENT</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {documents.filter(d => d.uploadedBy === null).map((document) => (
                      <div key={document.id} className="bg-white border border-border p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-lg mb-1">{document.title}</h4>
                            {document.description && (
                              <p className="text-body-small text-muted-foreground mb-2 line-clamp-2">
                                {document.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-body-small text-muted-foreground mb-3">
                          <div>
                            <span className="font-medium">File:</span> {document.fileName}
                          </div>
                          <div>
                            {formatFileSize(document.fileSize)}
                          </div>
                        </div>
                        {document.category && (
                          <div className="mb-3">
                            <span className="text-caption px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {document.category}
                            </span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <a
                            href={document.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 bg-primary text-white hover:bg-primary/90 transition-colors text-body-small flex items-center justify-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                          <button
                            onClick={() => deleteDocument(document.id)}
                            className="px-3 py-2 border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors text-body-small"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-caption text-muted-foreground mt-2">
                          Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Document Upload/Edit Modal */}
              {showDocumentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
                      <h3 className="text-2xl font-medium">UPLOAD NEW DOCUMENT</h3>
                      <button
                        onClick={closeDocumentModal}
                        className="p-2 hover:bg-secondary rounded transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-label font-medium mb-2">
                          Title <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={documentForm.title}
                          onChange={(e) => setDocumentForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter document title"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-label font-medium mb-2">Description</label>
                        <textarea
                          value={documentForm.description}
                          onChange={(e) => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                          placeholder="Describe your document..."
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-label font-medium mb-2">Category</label>
                        <input
                          type="text"
                          value={documentForm.category}
                          onChange={(e) => setDocumentForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g., Portfolio, Reference, Contract, Other"
                        />
                      </div>

                      {/* File Upload */}
                      <div>
                        <label className="block text-label font-medium mb-2">
                          Document File <span className="text-destructive">*</span>
                        </label>
                        {documentForm.fileUrl ? (
                          <div className="space-y-2">
                            <div className="p-4 bg-secondary border border-border rounded">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-5 h-5 text-muted-foreground" />
                                  <div>
                                    <p className="text-body font-medium">{documentForm.fileName}</p>
                                    <p className="text-caption text-muted-foreground">
                                      {formatFileSize(documentForm.fileSize)} • {documentForm.fileType}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setDocumentForm(prev => ({ 
                                    ...prev, 
                                    fileUrl: '', 
                                    fileName: '', 
                                    fileSize: 0, 
                                    fileType: '',
                                    file: null 
                                  }))}
                                  className="text-destructive text-body-small hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-border rounded p-8 text-center">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp,.gif"
                              onChange={handleDocumentFileChange}
                              className="hidden"
                              id="document-file-upload"
                              disabled={uploadingDocument}
                            />
                            <label
                              htmlFor="document-file-upload"
                              className={`cursor-pointer inline-flex flex-col items-center gap-2 ${uploadingDocument ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {uploadingDocument ? (
                                <>
                                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                  <span className="text-body-small text-muted-foreground">Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-muted-foreground" />
                                  <span className="text-body-small text-muted-foreground">
                                    Click to upload or drag and drop
                                  </span>
                                  <span className="text-caption text-muted-foreground">
                                    PDF, Word, Excel, PowerPoint, Text, Images up to 50MB
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-4 border-t border-border">
                        <button
                          onClick={closeDocumentModal}
                          className="flex-1 px-6 py-3 border border-border hover:bg-secondary transition-colors"
                        >
                          <span className="text-button-secondary">CANCEL</span>
                        </button>
                        <button
                          onClick={handleSaveDocument}
                          disabled={!documentForm.title.trim() || !documentForm.fileUrl || uploadingDocument}
                          className="flex-1 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-button-primary">
                            UPLOAD DOCUMENT
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}