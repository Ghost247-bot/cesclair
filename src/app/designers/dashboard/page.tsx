"use client";

import { useState, useEffect, Suspense, lazy, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { SkeletonStats, SkeletonTable } from "@/components/skeleton-loaders";
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
  ExternalLink,
  Eye,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  Calendar,
  DollarSign,
  Award,
  Activity,
  Bell,
  ChevronDown,
  SortAsc,
  SortDesc,
  BarChart3,
  PieChart,
  Target,
  Zap,
  MessageSquare,
  Share2,
  FileDown,
  Calendar as CalendarIcon,
  TrendingDown,
  Percent
} from "lucide-react";
import Image from "next/image";
import Footer from "@/components/sections/footer";
import { SigningFrame } from "@/components/docusign/SigningFrame";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  totalEarnings: number;
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
  envelopeUrl: string | null;
  contractFileUrl?: string | null;
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
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [showContractDetailsModal, setShowContractDetailsModal] = useState(false);
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
  
  // Search and filter states
  const [designSearchQuery, setDesignSearchQuery] = useState("");
  const [designStatusFilter, setDesignStatusFilter] = useState<string>("all");
  const [contractSearchQuery, setContractSearchQuery] = useState("");
  const [contractStatusFilter, setContractStatusFilter] = useState<string>("all");
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");
  const [documentCategoryFilter, setDocumentCategoryFilter] = useState<string>("all");
  
  // Debounced search queries
  const debouncedDesignSearchQuery = useDebounce(designSearchQuery, 300);
  const debouncedContractSearchQuery = useDebounce(contractSearchQuery, 300);
  const debouncedDocumentSearchQuery = useDebounce(documentSearchQuery, 300);
  
  // Sort states
  const [designSortBy, setDesignSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [contractSortBy, setContractSortBy] = useState<"newest" | "oldest" | "amount">("newest");
  
  // Contract date filter states
  const [contractDateFrom, setContractDateFrom] = useState<string>("");
  const [contractDateTo, setContractDateTo] = useState<string>("");
  const [contractViewMode, setContractViewMode] = useState<"list" | "timeline">("list");
  
  // Analytics and additional features
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: Date;
    read: boolean;
  }>>([]);

  // Check authentication and role
  useEffect(() => {
    // Prevent multiple checks if already checked, if role is being updated, or if designer is already loaded
    if (sessionPending || isUpdatingRole || hasCheckedDesigner || designer) {
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
      if (userEmail) {
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
      if (userEmail) {
        setHasCheckedDesigner(true);
        checkDesignerStatus(userEmail);
        return;
      } else {
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
                // Role updated, refetch session and directly fetch designer data
                // Don't reset hasCheckedDesigner - let the refetch handle the next check
                await refetch();
                // Directly fetch designer data instead of waiting for useEffect
                await fetchDesignerByEmail(email);
                setIsUpdatingRole(false);
              } else {
                // Role update failed, but still allow access if approved
                setIsUpdatingRole(false);
                fetchDesignerByEmail(email);
              }
            } catch (roleUpdateError) {
              if (process.env.NODE_ENV === 'development') {
                console.warn("Error updating role:", roleUpdateError);
              }
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
      if (process.env.NODE_ENV === 'development') {
        console.error("Error checking designer status:", error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to fetch designer:", error);
      }
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

      // Fetch designs with caching
      const designsRes = await fetch(`/api/designs/designer/${designerId}?limit=50`, {
        next: { revalidate: 60 }
      });
      const designsData = await designsRes.json();
      setDesigns(designsData);

      // Fetch contracts - fetch with pagination
      try {
        const contractsRes = await fetch(`/api/contracts/designer/${designerId}?limit=100`, {
          credentials: 'include',
          next: { revalidate: 60 }
        });
        
        if (!contractsRes.ok) {
          throw new Error(`Failed to fetch contracts: ${contractsRes.status}`);
        }
        
        const data = await contractsRes.json();
        
        // Normalize data - handle both old array format and new { contracts: [] } format
        const contractsArray = Array.isArray(data?.contracts) 
          ? data.contracts 
          : Array.isArray(data) 
            ? data 
            : [];
        
        setContracts(contractsArray);
        
        // Log warning if there's an error in the response
        if (data?.error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn("Contracts API returned error:", data.error);
          }
          toast.error(data.error || "Failed to load some contract data");
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching contracts:", error);
        }
        toast.error("Failed to load contracts. Please refresh the page.");
        setContracts([]);
      }

      // Fetch documents with caching
      const documentsRes = await fetch(`/api/documents/designer/${designerId}`, {
        next: { revalidate: 60 }
      });
      const documentsData = await documentsRes.json();
      setDocuments(documentsData);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to fetch dashboard data:", error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error("Logout error:", error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to delete design:", error);
      }
    }
  };

  const handleSignContract = (contract: Contract) => {
    if (!contract.envelopeId) {
      toast.error('This contract does not have an envelope ID. Please contact admin.');
      return;
    }
    setSigningContract(contract);
    // Scroll to signing section after a brief delay
    setTimeout(() => {
      const signingSection = document.getElementById('signing-section');
      if (signingSection) {
        signingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, WebP, or GIF images are allowed.');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit. Please choose a smaller image.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/design', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('Upload succeeded but no URL was returned');
      }
      
      setDesignForm(prev => ({ ...prev, imageUrl: data.url, imageFile: file }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Upload error:', error);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      // Reset image file on error
      setDesignForm(prev => ({ ...prev, imageFile: null }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Set the file immediately for preview purposes
      setDesignForm(prev => ({ ...prev, imageFile: file }));
      // Upload the file
      handleImageUpload(file);
    }
    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
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
    if (!designer) {
      toast.error('Designer information not available. Please refresh the page.');
      return;
    }

    if (!designer.id) {
      toast.error('Designer ID is missing. Please refresh the page.');
      return;
    }

    if (!designForm.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const url = editingDesign 
        ? `/api/designs/${editingDesign.id}`
        : '/api/designs';
      
      const method = editingDesign ? 'PUT' : 'POST';

      const requestBody = {
          ...(editingDesign ? {} : { designerId: designer.id }),
          title: designForm.title.trim(),
          description: designForm.description.trim() || null,
          category: designForm.category.trim() || null,
          imageUrl: designForm.imageUrl || null,
          status: editingDesign ? undefined : 'draft', // New designs start as draft
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('Saving design:', { url, method, requestBody });
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        if (process.env.NODE_ENV === 'development') {
          console.error('Save design API error:', { status: response.status, errorData });
        }
        throw new Error(errorData.error || `Failed to save design: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('Design saved successfully:', result);
      }
      toast.success(editingDesign ? 'Design updated successfully' : 'Design created successfully');
      closeDesignModal();
      if (designer) {
        await fetchDashboardData(designer.id);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Save design error:', error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Submit design error:', error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Upload error:', error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Save document error:', error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to delete document:", error);
      }
      toast.error("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Filter and sort functions (using debounced queries and useMemo for performance)
  const filteredDesigns = useMemo(() => designs.filter(design => {
    const matchesSearch = !debouncedDesignSearchQuery || 
      design.title.toLowerCase().includes(debouncedDesignSearchQuery.toLowerCase()) ||
      (design.description && design.description.toLowerCase().includes(debouncedDesignSearchQuery.toLowerCase()));
    const matchesStatus = designStatusFilter === "all" || design.status === designStatusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (designSortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (designSortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (designSortBy === "title") return a.title.localeCompare(b.title);
    return 0;
  }), [designs, debouncedDesignSearchQuery, designStatusFilter, designSortBy]);

  const filteredContracts = useMemo(() => contracts.filter(contract => {
    const matchesSearch = !debouncedContractSearchQuery || 
      contract.title.toLowerCase().includes(debouncedContractSearchQuery.toLowerCase()) ||
      (contract.description && contract.description.toLowerCase().includes(debouncedContractSearchQuery.toLowerCase()));
    const matchesStatus = contractStatusFilter === "all" || contract.status === contractStatusFilter;
    
    // Date range filtering
    let matchesDate = true;
    if (contractDateFrom) {
      const fromDate = new Date(contractDateFrom);
      const contractDate = new Date(contract.createdAt);
      if (contractDate < fromDate) matchesDate = false;
    }
    if (contractDateTo) {
      const toDate = new Date(contractDateTo);
      toDate.setHours(23, 59, 59, 999);
      const contractDate = new Date(contract.createdAt);
      if (contractDate > toDate) matchesDate = false;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    if (contractSortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (contractSortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (contractSortBy === "amount") {
      const amountA = parseFloat(a.amount || "0");
      const amountB = parseFloat(b.amount || "0");
      return amountB - amountA;
    }
    return 0;
  }), [contracts, debouncedContractSearchQuery, contractStatusFilter, contractDateFrom, contractDateTo, contractSortBy]);

  const filteredDocuments = useMemo(() => documents.filter(document => {
    const matchesSearch = !debouncedDocumentSearchQuery || 
      document.title.toLowerCase().includes(debouncedDocumentSearchQuery.toLowerCase()) ||
      (document.description && document.description.toLowerCase().includes(debouncedDocumentSearchQuery.toLowerCase()));
    const matchesCategory = documentCategoryFilter === "all" || document.category === documentCategoryFilter;
    return matchesSearch && matchesCategory;
  }), [documents, debouncedDocumentSearchQuery, documentCategoryFilter]);

  // Calculate additional stats
  const pendingContracts = contracts.filter(c => c.status === "awarded" && c.envelopeStatus !== "completed").length;
  // Total earnings is now fetched from the database via API (only counts completed contracts with completedAt set)
  const totalEarnings = stats?.totalEarnings || 0;
  const pendingDesigns = designs.filter(d => d.status === "submitted").length;
  const approvedDesigns = designs.filter(d => d.status === "approved").length;
  
  // Recent items (last 5)
  const recentDesigns = [...designs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const recentContracts = [...contracts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  
  // Profile completion percentage
  const profileFields = [
    designer?.bio,
    designer?.portfolioUrl,
    designer?.specialties,
    designer?.avatarUrl
  ];
  const completedFields = profileFields.filter(f => f && f.trim() !== "").length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  // Analytics calculations
  const designStatusData = [
    { name: 'Approved', value: designs.filter(d => d.status === 'approved').length, color: '#10b981' },
    { name: 'Submitted', value: designs.filter(d => d.status === 'submitted').length, color: '#3b82f6' },
    { name: 'Draft', value: designs.filter(d => d.status === 'draft').length, color: '#6b7280' },
    { name: 'Rejected', value: designs.filter(d => d.status === 'rejected').length, color: '#ef4444' },
  ];

  // Monthly design submissions (last 6 months)
  const getMonthlyDesignData = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = designs.filter(d => {
        const designDate = new Date(d.createdAt);
        return designDate >= monthStart && designDate <= monthEnd;
      }).length;
      
      months.push({ month: monthName, designs: count });
    }
    return months;
  };

  // Monthly earnings (last 6 months)
  const getMonthlyEarningsData = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const earnings = contracts
        .filter(c => {
          if (c.status !== 'completed' || !c.completedAt) return false;
          const completedDate = new Date(c.completedAt);
          return completedDate >= monthStart && completedDate <= monthEnd;
        })
        .reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0);
      
      months.push({ month: monthName, earnings: earnings });
    }
    return months;
  };

  // Performance metrics
  const totalSubmittedDesigns = designs.filter(d => d.status === 'submitted' || d.status === 'approved' || d.status === 'rejected').length;
  const approvalRate = totalSubmittedDesigns > 0 
    ? Math.round((approvedDesigns / totalSubmittedDesigns) * 100) 
    : 0;
  const averageContractValue = contracts.filter(c => c.amount && c.status === 'completed').length > 0
    ? contracts
        .filter(c => c.amount && c.status === 'completed')
        .reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0) / contracts.filter(c => c.amount && c.status === 'completed').length
    : 0;
  const completionRate = contracts.filter(c => c.status === 'awarded' || c.status === 'completed').length > 0
    ? Math.round((stats?.contractsCompleted || 0) / (contracts.filter(c => c.status === 'awarded' || c.status === 'completed').length) * 100)
    : 0;

  // Activity timeline
  const activityTimeline = [
    ...designs.map(d => ({
      id: `design-${d.id}`,
      type: 'design' as const,
      action: d.status === 'approved' ? 'Design approved' : d.status === 'submitted' ? 'Design submitted' : 'Design created',
      title: d.title,
      timestamp: new Date(d.createdAt),
      status: d.status,
    })),
    ...contracts.map(c => ({
      id: `contract-${c.id}`,
      type: 'contract' as const,
      action: c.status === 'completed' ? 'Contract completed' : c.status === 'awarded' ? 'Contract awarded' : 'Contract created',
      title: c.title,
      timestamp: new Date(c.createdAt),
      status: c.status,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);

  // Export functions
  const exportDesigns = () => {
    const csv = [
      ['Title', 'Description', 'Category', 'Status', 'Created At'].join(','),
      ...designs.map(d => [
        `"${d.title}"`,
        `"${d.description || ''}"`,
        `"${d.category || ''}"`,
        d.status,
        new Date(d.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `designs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Designs exported successfully');
  };

  const exportContracts = () => {
    const csv = [
      ['Title', 'Amount', 'Status', 'Awarded At', 'Completed At', 'Created At'].join(','),
      ...contracts.map(c => [
        `"${c.title}"`,
        c.amount || '0',
        c.status,
        c.awardedAt ? new Date(c.awardedAt).toLocaleDateString() : '',
        c.completedAt ? new Date(c.completedAt).toLocaleDateString() : '',
        new Date(c.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contracts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Contracts exported successfully');
  };

  // Upcoming deadlines (contracts with completion dates in next 30 days)
  const upcomingDeadlines = contracts
    .filter(c => {
      if (!c.completedAt || c.status === 'completed') return false;
      const deadline = new Date(c.completedAt);
      const now = new Date();
      const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 30;
    })
    .sort((a, b) => {
      const dateA = new Date(a.completedAt || '').getTime();
      const dateB = new Date(b.completedAt || '').getTime();
      return dateA - dateB;
    })
    .slice(0, 5);

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
    <main className="pt-[48px] sm:pt-[51px] md:pt-[54px] lg:pt-[57px] min-h-screen bg-background">
      {/* Header */}
      <section className="bg-secondary py-6 sm:py-7 md:py-8 border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium mb-1.5 sm:mb-2">DESIGNER DASHBOARD</h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Welcome back, {designer.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 border border-primary hover:bg-secondary transition-colors text-xs sm:text-sm"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-button-secondary">LOGOUT</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      {stats && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-6 sm:py-7 md:py-8 bg-white border-b border-border"
        >
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-3 sm:p-4 md:p-5 lg:p-6 bg-secondary hover:shadow-md transition-shadow"
              >
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-3 text-primary" />
                <div className="text-xl sm:text-2xl md:text-3xl font-medium mb-0.75 sm:mb-1">{stats.totalDesigns}</div>
                <div className="text-label text-muted-foreground">TOTAL DESIGNS</div>
                {approvedDesigns > 0 && (
                  <div className="text-xs text-green-600 mt-1">{approvedDesigns} Approved</div>
                )}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-3 sm:p-4 md:p-5 lg:p-6 bg-secondary hover:shadow-md transition-shadow"
              >
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-3 text-primary" />
                <div className="text-xl sm:text-2xl md:text-3xl font-medium mb-0.75 sm:mb-1">{stats.contractsAwarded}</div>
                <div className="text-label text-muted-foreground">CONTRACTS AWARDED</div>
                {pendingContracts > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="text-xs text-orange-600 mt-1 flex items-center justify-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {pendingContracts} Pending
                  </motion.div>
                )}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-3 sm:p-4 md:p-5 lg:p-6 bg-secondary hover:shadow-md transition-shadow"
              >
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-3 text-green-600" />
                <div className="text-xl sm:text-2xl md:text-3xl font-medium mb-0.75 sm:mb-1">{stats.contractsCompleted}</div>
                <div className="text-label text-muted-foreground">CONTRACTS COMPLETED</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-3 sm:p-4 md:p-5 lg:p-6 bg-secondary hover:shadow-md transition-shadow"
              >
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-3 text-green-600" />
                <div className="text-xl sm:text-2xl md:text-3xl font-medium mb-0.75 sm:mb-1">${totalEarnings.toFixed(2)}</div>
                <div className="text-label text-muted-foreground">TOTAL EARNINGS</div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Tabs */}
      <section className="py-6 sm:py-7 md:py-8">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex gap-2 sm:gap-3 md:gap-4 border-b border-border mb-6 sm:mb-7 md:mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-button-secondary border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab("designs")}
              className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-button-secondary border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "designs"
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              MY DESIGNS ({designs.length})
            </button>
            <button
              onClick={() => setActiveTab("contracts")}
              className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-button-secondary border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "contracts"
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              CONTRACTS ({contracts.length})
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-button-secondary border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "documents"
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              DOCUMENTS ({documents.length})
            </button>
          </div>

          {/* Overview Tab */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-5 md:space-y-6"
              >
              {/* Quick Actions & Profile Completion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                {/* Profile Completion */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-white border border-border p-4 sm:p-5 md:p-6"
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-medium">PROFILE COMPLETION</h3>
                    <span className="text-xl sm:text-2xl font-bold text-primary">{profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 mb-3 sm:mb-4">
                    <div 
                      className="bg-primary h-2.5 sm:h-3 rounded-full transition-all"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                  {profileCompletion < 100 && (
                    <button
                      onClick={() => {
                        setProfileForm({
                          bio: designer.bio || '',
                          portfolioUrl: designer.portfolioUrl || '',
                          specialties: designer.specialties || '',
                        });
                        setShowEditProfileModal(true);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Complete your profile →
                    </button>
                  )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-white border border-border p-4 sm:p-5 md:p-6"
                >
                  <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">QUICK ACTIONS</h3>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <button
                      onClick={() => {
                        setActiveTab("designs");
                        openDesignModal();
                      }}
                      className="p-3 sm:p-3.5 md:p-4 border border-border hover:bg-secondary transition-colors text-left"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mb-1.5 sm:mb-2 text-primary" />
                      <div className="text-xs sm:text-sm font-medium">New Design</div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("documents");
                        openDocumentModal();
                      }}
                      className="p-3 sm:p-3.5 md:p-4 border border-border hover:bg-secondary transition-colors text-left"
                    >
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5 mb-1.5 sm:mb-2 text-primary" />
                      <div className="text-xs sm:text-sm font-medium">Upload Document</div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("contracts");
                      }}
                      className="p-3 sm:p-3.5 md:p-4 border border-border hover:bg-secondary transition-colors text-left"
                    >
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mb-1.5 sm:mb-2 text-primary" />
                      <div className="text-xs sm:text-sm font-medium">View Contracts</div>
                    </button>
                    <button
                      onClick={() => {
                        setProfileForm({
                          bio: designer.bio || '',
                          portfolioUrl: designer.portfolioUrl || '',
                          specialties: designer.specialties || '',
                        });
                        setShowEditProfileModal(true);
                      }}
                      className="p-3 sm:p-3.5 md:p-4 border border-border hover:bg-secondary transition-colors text-left"
                    >
                      <Edit className="w-4 h-4 sm:w-5 sm:h-5 mb-1.5 sm:mb-2 text-primary" />
                      <div className="text-xs sm:text-sm font-medium">Edit Profile</div>
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-white border border-border p-4 sm:p-5 md:p-6"
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-0.75 sm:mb-1">${totalEarnings.toFixed(2)}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Earnings</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.75 sm:mt-1">
                    {contracts.filter(c => c.status === 'completed').length} completed contracts
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="bg-white border border-border p-4 sm:p-5 md:p-6"
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-0.75 sm:mb-1">{contracts.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Contracts</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.75 sm:mt-1">
                    {pendingContracts} pending signature
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="bg-white border border-border p-4 sm:p-5 md:p-6"
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-0.75 sm:mb-1">{designs.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Designs</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {approvedDesigns} approved
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="bg-white border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Percent className="w-5 h-5 text-orange-600" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold mb-1">{approvalRate}%</div>
                  <div className="text-sm text-muted-foreground">Approval Rate</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {approvedDesigns} of {totalSubmittedDesigns} submitted
                  </div>
                </motion.div>
              </div>

              {/* Performance Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Earnings Chart */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="bg-white border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">EARNINGS OVER TIME</h3>
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  {getMonthlyEarningsData().some(m => m.earnings > 0) ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={getMonthlyEarningsData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Bar dataKey="earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                      No earnings data available
                    </div>
                  )}
                </motion.div>

                {/* Contract Status Breakdown */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="bg-white border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">CONTRACT STATUS</h3>
                    <PieChart className="w-5 h-5 text-muted-foreground" />
                  </div>
                  {contracts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: 'Completed', value: contracts.filter(c => c.status === 'completed').length, color: '#10b981' },
                            { name: 'Awarded', value: contracts.filter(c => c.status === 'awarded').length, color: '#3b82f6' },
                            { name: 'Signed', value: contracts.filter(c => c.status === 'signed').length, color: '#8b5cf6' },
                            { name: 'Pending', value: contracts.filter(c => c.status === 'pending').length, color: '#f59e0b' },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Completed', value: contracts.filter(c => c.status === 'completed').length, color: '#10b981' },
                            { name: 'Awarded', value: contracts.filter(c => c.status === 'awarded').length, color: '#3b82f6' },
                            { name: 'Signed', value: contracts.filter(c => c.status === 'signed').length, color: '#8b5cf6' },
                            { name: 'Pending', value: contracts.filter(c => c.status === 'pending').length, color: '#f59e0b' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                      No contracts data available
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Key Insights */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="bg-white border border-border p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium">KEY INSIGHTS</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Average Contract Value</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      ${averageContractValue > 0 ? averageContractValue.toFixed(2) : '0.00'}
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      Based on completed contracts
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Completion Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {completionRate}%
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      Contracts completed vs awarded
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Active Contracts</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {contracts.filter(c => c.status === 'awarded' || c.status === 'signed').length}
                    </div>
                    <div className="text-xs text-purple-700 mt-1">
                      Currently in progress
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Activity Timeline */}
              {activityTimeline.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.0 }}
                  className="bg-white border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-medium">RECENT ACTIVITY</h3>
                    </div>
                    <button
                      onClick={() => setShowAnalytics(!showAnalytics)}
                      className="text-sm text-primary hover:underline"
                    >
                      {showAnalytics ? 'Hide' : 'Show'} All
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {activityTimeline
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .slice(0, showAnalytics ? activityTimeline.length : 5)
                      .map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 1.1 + index * 0.05 }}
                          className="flex items-start gap-3 p-3 border border-border hover:bg-secondary transition-colors rounded"
                        >
                          <div className={`p-2 rounded-full ${
                            activity.type === 'contract' ? 'bg-blue-100' :
                            activity.type === 'design' ? 'bg-purple-100' :
                            'bg-gray-100'
                          }`}>
                            {activity.type === 'contract' ? (
                              <Briefcase className={`w-4 h-4 ${
                                activity.action.includes('completed') ? 'text-green-600' :
                                activity.action.includes('awarded') ? 'text-blue-600' :
                                'text-gray-600'
                              }`} />
                            ) : (
                              <FileText className={`w-4 h-4 ${
                                activity.action.includes('approved') ? 'text-green-600' :
                                activity.action.includes('submitted') ? 'text-blue-600' :
                                'text-gray-600'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{activity.action}</div>
                            <div className="text-xs text-muted-foreground">{activity.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* Pending Actions */}
              <AnimatePresence>
                {(pendingContracts > 0 || pendingDesigns > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-orange-50 border border-orange-200 p-6 rounded-lg"
                  >
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-medium text-orange-900">PENDING ACTIONS</h3>
                  </div>
                  <div className="space-y-2">
                    {pendingContracts > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 bg-white rounded border border-orange-200"
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <FileSignature className="w-4 h-4 text-orange-600" />
                          </motion.div>
                          <span className="text-sm">
                            {pendingContracts} contract{pendingContracts > 1 ? 's' : ''} awaiting your signature
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveTab("contracts")}
                          className="text-sm text-primary hover:underline"
                        >
                          View →
                        </button>
                      </motion.div>
                    )}
                    {pendingDesigns > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 bg-white rounded border border-orange-200"
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <Clock className="w-4 h-4 text-orange-600" />
                          </motion.div>
                          <span className="text-sm">
                            {pendingDesigns} design{pendingDesigns > 1 ? 's' : ''} under review
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveTab("designs")}
                          className="text-sm text-primary hover:underline"
                        >
                          View →
                        </button>
                      </motion.div>
                    )}
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Information */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white border border-border p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-medium">PROFILE INFORMATION</h3>
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
              </motion.div>

              {/* Recent Activity */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Designs */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="bg-white border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">RECENT DESIGNS</h3>
                    <button
                      onClick={() => setActiveTab("designs")}
                      className="text-sm text-primary hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  {recentDesigns.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No designs yet</p>
                  ) : (
                    <div className="space-y-3">
                      {recentDesigns.map((design, index) => (
                        <motion.div
                          key={design.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-between p-3 border border-border hover:bg-secondary transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{design.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(design.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            design.status === "approved" ? "bg-green-100 text-green-800" :
                            design.status === "submitted" ? "bg-blue-100 text-blue-800" :
                            design.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {design.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Recent Contracts */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="bg-white border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">RECENT CONTRACTS</h3>
                    <button
                      onClick={() => setActiveTab("contracts")}
                      className="text-sm text-primary hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  {recentContracts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No contracts yet</p>
                  ) : (
                    <div className="space-y-3">
                      {recentContracts.map((contract, index) => (
                        <motion.div
                          key={contract.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                          whileHover={{ x: -5 }}
                          className="flex items-center justify-between p-3 border border-border hover:bg-secondary transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{contract.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {contract.amount && `$${parseFloat(contract.amount).toFixed(2)} • `}
                              {new Date(contract.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            contract.status === "completed" ? "bg-green-100 text-green-800" :
                            contract.status === "awarded" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {contract.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Profile Modal */}
          {showEditProfileModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-medium">EDIT PROFILE</h3>
                  <button
                    onClick={() => setShowEditProfileModal(false)}
                    className="p-2 hover:bg-secondary rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
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
                      className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 border border-border hover:bg-secondary transition-colors text-xs sm:text-sm"
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
                          if (process.env.NODE_ENV === 'development') {
                            console.error('Update profile error:', error);
                          }
                          toast.error(error instanceof Error ? error.message : 'Failed to update profile');
                        } finally {
                          setUpdatingProfile(false);
                        }
                      }}
                      disabled={updatingProfile}
                      className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
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
          <AnimatePresence mode="wait">
            {activeTab === "designs" && (
              <motion.div
                key="designs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-5 md:space-y-6"
              >
              {/* Add Design Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg md:text-xl font-medium">MY DESIGNS</h3>
                <button
                  onClick={() => {
                    if (!designer) {
                      toast.error('Designer information not loaded. Please refresh the page.');
                      return;
                    }
                    openDesignModal();
                  }}
                  disabled={!designer}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-button-primary">UPLOAD DESIGN</span>
                </button>
              </div>

              {filteredDesigns.length === 0 ? (
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
                  {filteredDesigns.map((design, index) => (
                    <motion.div
                      key={design.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-white border border-border p-4 hover:shadow-lg transition-shadow"
                    >
                      {/* Design Image */}
                      {design.imageUrl && (
                        <div className="relative w-full h-48 mb-4 bg-secondary rounded overflow-hidden">
                          {design.imageUrl.startsWith('/uploads/') ? (
                            <img
                              src={design.imageUrl}
                              alt={design.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                          <Image
                            src={design.imageUrl}
                            alt={design.title}
                            fill
                            className="object-cover"
                          />
                          )}
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
                            {design.status === 'approved' && 'Approved by Cesclair'}
                            {design.status === 'rejected' && 'Declined by Cesclair'}
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
                    </motion.div>
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

                    <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
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
                              {designForm.imageUrl.startsWith('/uploads/') ? (
                                <img
                                  src={designForm.imageUrl}
                                  alt="Design preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              ) : (
                              <Image
                                src={designForm.imageUrl}
                                alt="Design preview"
                                fill
                                className="object-cover"
                              />
                              )}
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
                          className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 border border-border hover:bg-secondary transition-colors text-xs sm:text-sm"
                        >
                          <span className="text-button-secondary">CANCEL</span>
                        </button>
                        <button
                          onClick={handleSaveDesign}
                          disabled={!designForm.title.trim() || uploadingImage || !designer}
                          className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        >
                          {uploadingImage ? (
                            <span className="text-button-primary flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading...
                            </span>
                          ) : (
                          <span className="text-button-primary">
                            {editingDesign ? 'UPDATE DESIGN' : 'CREATE DESIGN'}
                          </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contracts Tab */}
          <AnimatePresence mode="wait">
            {activeTab === "contracts" && (
              <motion.div
                key="contracts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-5 md:space-y-6"
              >
              {/* Contract Statistics Summary */}
              {!signingContract && (
                <div className="grid md:grid-cols-4 gap-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-border p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-muted-foreground">Total Contracts</span>
                    </div>
                    <div className="text-2xl font-bold">{filteredContracts.length}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {contracts.length} total
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-border p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Total Value</span>
                    </div>
                    <div className="text-2xl font-bold">
                      ${filteredContracts
                        .filter(c => c.amount)
                        .reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0)
                        .toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {filteredContracts.filter(c => c.amount).length} with amounts
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-border p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Completed</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {filteredContracts.filter(c => c.status === 'completed').length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const earned = filteredContracts.filter(c => c.status === 'completed' && c.amount)
                          .reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0);
                        return earned > 0 ? `$${earned.toFixed(2)} earned` : '';
                      })()}
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-border p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {filteredContracts.filter(c => c.status === 'awarded' || c.status === 'pending').length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Awaiting action
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Search and Filter Bar */}
              {!signingContract && (
                <div className="bg-white border border-border p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Search */}
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search contracts..."
                          value={contractSearchQuery}
                          onChange={(e) => setContractSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      {/* Status Filter */}
                      <select
                        value={contractStatusFilter}
                        onChange={(e) => setContractStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="awarded">Awarded</option>
                        <option value="signed">Signed</option>
                        <option value="completed">Completed</option>
                      </select>
                      {/* Sort */}
                      <select
                        value={contractSortBy}
                        onChange={(e) => setContractSortBy(e.target.value as "newest" | "oldest" | "amount")}
                        className="px-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="amount">Highest Amount</option>
                      </select>
                      {/* View Mode */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setContractViewMode("list")}
                          className={`px-4 py-2 border border-border transition-colors ${
                            contractViewMode === "list" ? "bg-primary text-white" : "hover:bg-secondary"
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setContractViewMode("timeline")}
                          className={`px-4 py-2 border border-border transition-colors ${
                            contractViewMode === "timeline" ? "bg-primary text-white" : "hover:bg-secondary"
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Export Button */}
                      <button
                        onClick={() => {
                          const csvContent = [
                            ['Title', 'Status', 'Amount', 'Awarded Date', 'Signed Date', 'Completed Date'].join(','),
                            ...filteredContracts.map(c => [
                              `"${c.title}"`,
                              c.status,
                              c.amount || '0',
                              c.awardedAt ? new Date(c.awardedAt).toLocaleDateString() : '',
                              c.signedAt ? new Date(c.signedAt).toLocaleDateString() : '',
                              c.completedAt ? new Date(c.completedAt).toLocaleDateString() : ''
                            ].join(','))
                          ].join('\n');
                          const blob = new Blob([csvContent], { type: 'text/csv' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `contracts-export-${new Date().toISOString().split('T')[0]}.csv`;
                          a.click();
                          window.URL.revokeObjectURL(url);
                          toast.success('Contracts exported successfully');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary transition-colors"
                      >
                        <FileDown className="w-4 h-4" />
                        <span className="text-sm">Export</span>
                      </button>
                    </div>
                    {/* Date Range Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <label className="text-sm text-muted-foreground">From:</label>
                        <input
                          type="date"
                          value={contractDateFrom}
                          onChange={(e) => setContractDateFrom(e.target.value)}
                          className="px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">To:</label>
                        <input
                          type="date"
                          value={contractDateTo}
                          onChange={(e) => setContractDateTo(e.target.value)}
                          className="px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      {(contractDateFrom || contractDateTo) && (
                        <button
                          onClick={() => {
                            setContractDateFrom("");
                            setContractDateTo("");
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          Clear dates
                        </button>
                      )}
                    </div>
                    {filteredContracts.length !== contracts.length && (
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredContracts.length} of {contracts.length} contracts
                      </div>
                    )}
                  </div>
                </div>
              )}

              {signingContract ? (
                <div id="signing-section" className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <FileSignature className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 mb-1">Ready to Sign</h4>
                        <p className="text-sm text-blue-700">
                          Please review the contract document carefully before signing. Once signed, the contract will be legally binding.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
                    <div>
                      <h3 className="text-2xl font-medium">Sign Contract: {signingContract.title}</h3>
                      {signingContract.amount && (
                        <p className="text-muted-foreground mt-1">Amount: ${parseFloat(signingContract.amount).toFixed(2)}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSigningContract(null)}
                      className="px-6 py-2 border border-border hover:bg-secondary transition-colors"
                    >
                      <span className="text-button-secondary">CANCEL</span>
                    </button>
                  </div>
                  
                  {signingContract.contractFileUrl && (
                    <div className="mb-4">
                      <a
                        href={signingContract.contractFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Contract Document Before Signing</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  
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
              ) : !Array.isArray(filteredContracts) || filteredContracts.length === 0 ? (
                <div className="text-center py-12 bg-white border border-border">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">You don't have any contracts yet.</p>
                </div>
              ) : contractViewMode === "timeline" ? (
                /* Timeline View */
                <div className="bg-white border border-border p-6">
                  <h3 className="text-base sm:text-lg font-medium mb-4 sm:mb-5 md:mb-6">CONTRACT TIMELINE</h3>
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                    <div className="space-y-6">
                      {filteredContracts
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((contract, index) => {
                          const milestones = [
                            { label: 'Created', date: contract.createdAt, icon: Plus, color: 'gray' },
                            contract.awardedAt && { label: 'Awarded', date: contract.awardedAt, icon: Award, color: 'blue' },
                            contract.signedAt && { label: 'Signed', date: contract.signedAt, icon: FileSignature, color: 'purple' },
                            contract.completedAt && { label: 'Completed', date: contract.completedAt, icon: CheckCircle, color: 'green' },
                          ].filter(Boolean) as Array<{ label: string; date: string; icon: any; color: string }>;
                          
                          return (
                            <motion.div
                              key={contract.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: index * 0.1 }}
                              className="relative pl-12"
                            >
                              <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                                contract.status === 'completed' ? 'bg-green-500' :
                                contract.status === 'signed' ? 'bg-purple-500' :
                                contract.status === 'awarded' ? 'bg-blue-500' :
                                'bg-gray-500'
                              }`}>
                                <Briefcase className="w-4 h-4 text-white" />
                              </div>
                              <div className="bg-secondary border border-border p-4 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-lg">{contract.title}</h4>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    contract.status === "completed" ? "bg-green-100 text-green-800" :
                                    contract.status === "awarded" ? "bg-blue-100 text-blue-800" :
                                    contract.status === "signed" ? "bg-purple-100 text-purple-800" :
                                    "bg-gray-100 text-gray-800"
                                  }`}>
                                    {contract.status.toUpperCase()}
                                  </span>
                                </div>
                                {contract.amount && (
                                  <div className="text-sm font-medium text-green-600 mb-2">
                                    ${parseFloat(contract.amount).toFixed(2)}
                                  </div>
                                )}
                                <div className="space-y-2 mb-4">
                                  {milestones.map((milestone, mIndex) => {
                                    const Icon = milestone.icon;
                                    return (
                                      <div key={mIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Icon className={`w-4 h-4 text-${milestone.color}-600`} />
                                        <span className="font-medium">{milestone.label}:</span>
                                        <span>{new Date(milestone.date).toLocaleDateString()}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setViewingContract(contract);
                                      setShowContractDetailsModal(true);
                                    }}
                                    className="text-sm text-primary hover:underline"
                                  >
                                    View Details →
                                  </button>
                                  {contract.status === "awarded" && contract.envelopeStatus !== "completed" && (
                                    <button
                                      onClick={() => handleSignContract(contract)}
                                      className="text-sm text-primary hover:underline ml-4"
                                    >
                                      Sign Contract →
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {(Array.isArray(filteredContracts) ? filteredContracts : []).map((contract, index) => (
                    <motion.div
                      key={contract.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className="bg-white border border-border p-6"
                    >
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
                        {contract.contractFileUrl && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-label">Document Uploaded</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Payment Tracking */}
                      {contract.amount && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Payment Status</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              contract.status === 'completed' ? 'bg-green-100 text-green-800' :
                              contract.status === 'signed' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {contract.status === 'completed' ? 'PAID' :
                               contract.status === 'signed' ? 'PENDING PAYMENT' :
                               'NOT PAID'}
                            </span>
                          </div>
                          <div className="text-sm text-blue-700">
                            <div>Contract Value: <span className="font-medium">${parseFloat(contract.amount).toFixed(2)}</span></div>
                            {contract.status === 'completed' && contract.completedAt && (
                              <div className="mt-1">
                                Payment completed on {new Date(contract.completedAt).toLocaleDateString()}
                              </div>
                            )}
                            {contract.status === 'signed' && contract.signedAt && (
                              <div className="mt-1">
                                Awaiting payment processing (signed on {new Date(contract.signedAt).toLocaleDateString()})
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            setViewingContract(contract);
                            setShowContractDetailsModal(true);
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 border border-border hover:bg-secondary transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-button-secondary">VIEW DETAILS</span>
                        </button>
                        
                        {contract.contractFileUrl && (
                          <a
                            href={contract.contractFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-border hover:bg-secondary transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span className="text-button-secondary">VIEW DOCUMENT</span>
                          </a>
                        )}
                        
                        {contract.envelopeUrl && (
                          <a
                            href={contract.envelopeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-border hover:bg-secondary transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span className="text-button-secondary">VIEW ENVELOPE</span>
                          </a>
                        )}
                        
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
                          <div className="flex items-center gap-2 text-green-600 px-6 py-3">
                            <FileSignature className="w-4 h-4" />
                            <span className="text-body-small font-medium">Contract Signed Successfully</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Documents Tab */}
          <AnimatePresence mode="wait">
            {activeTab === "documents" && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-5 md:space-y-6"
              >
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

              {/* Documents from Cesclair */}
              {filteredDocuments.filter(d => d.uploadedBy !== null).length > 0 && (
                <div className="mb-4 sm:mb-5 md:mb-6">
                  <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Documents from Cesclair
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredDocuments.filter(d => d.uploadedBy !== null).map((document, index) => (
                      <motion.div
                        key={document.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-white border border-border p-4 hover:shadow-lg transition-shadow"
                      >
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
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                          <a
                            href={document.fileUrl}
                            download
                            className="flex-1 px-3 py-2 border border-border hover:bg-secondary transition-colors text-body-small flex items-center justify-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </div>
                        <div className="text-caption text-muted-foreground mt-2">
                          Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* My Documents */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  My Uploaded Documents
                </h4>
                {filteredDocuments.filter(d => d.uploadedBy === null).length === 0 ? (
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
                    {filteredDocuments.filter(d => d.uploadedBy === null).map((document, index) => (
                      <motion.div
                        key={document.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-white border border-border p-4 hover:shadow-lg transition-shadow"
                      >
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
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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

                    <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
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
                          className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 border border-border hover:bg-secondary transition-colors text-xs sm:text-sm"
                        >
                          <span className="text-button-secondary">CANCEL</span>
                        </button>
                        <button
                          onClick={handleSaveDocument}
                          disabled={!documentForm.title.trim() || !documentForm.fileUrl || uploadingDocument}
                          className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
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
      </section>
    </main>
    <Footer />

    {/* Contract Details Modal */}
    <AnimatePresence>
      {showContractDetailsModal && (
        <Dialog 
          open={showContractDetailsModal} 
          onOpenChange={(open) => {
            setShowContractDetailsModal(open);
            if (!open) {
              setViewingContract(null);
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-medium">Contract Details</DialogTitle>
              </DialogHeader>
              {viewingContract ? (
                <div className="space-y-4 sm:space-y-5 md:space-y-6 mt-3 sm:mt-4">
                  {/* Contract Title */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{viewingContract.title}</h3>
                    {viewingContract.description && (
                      <p className="text-body text-muted-foreground">{viewingContract.description}</p>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-3">
                    <span className={`text-caption px-4 py-2 rounded ${
                      viewingContract.status === "completed" ? "bg-green-100 text-green-800" :
                      viewingContract.status === "awarded" ? "bg-blue-100 text-blue-800" :
                      viewingContract.status === "signed" ? "bg-purple-100 text-purple-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      Status: {viewingContract.status.toUpperCase()}
                    </span>
                    {viewingContract.envelopeStatus && (
                      <span className={`text-caption px-4 py-2 rounded ${
                        viewingContract.envelopeStatus === "completed" ? "bg-green-100 text-green-800" :
                        viewingContract.envelopeStatus === "sent" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        Envelope: {viewingContract.envelopeStatus.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Contract Information Grid */}
                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
                    {viewingContract.amount && (
                      <div>
                        <label className="text-label text-muted-foreground block mb-1">Amount</label>
                        <p className="text-body font-medium">${parseFloat(viewingContract.amount).toFixed(2)}</p>
                      </div>
                    )}
                    
                    {viewingContract.createdAt && (
                      <div>
                        <label className="text-label text-muted-foreground block mb-1">Created</label>
                        <p className="text-body">{new Date(viewingContract.createdAt).toLocaleString()}</p>
                      </div>
                    )}

                    {viewingContract.awardedAt && (
                      <div>
                        <label className="text-label text-muted-foreground block mb-1">Awarded</label>
                        <p className="text-body">{viewingContract.awardedAt ? new Date(viewingContract.awardedAt).toLocaleString() : ''}</p>
                      </div>
                    )}

                    {viewingContract.signedAt && (
                      <div>
                        <label className="text-label text-muted-foreground block mb-1">Signed</label>
                        <p className="text-body">{viewingContract.signedAt ? new Date(viewingContract.signedAt).toLocaleString() : ''}</p>
                      </div>
                    )}

                    {viewingContract.completedAt && (
                      <div>
                        <label className="text-label text-muted-foreground block mb-1">Completed</label>
                        <p className="text-body">{viewingContract.completedAt ? new Date(viewingContract.completedAt).toLocaleString() : ''}</p>
                      </div>
                    )}

                    {viewingContract.envelopeId && (
                      <div>
                        <label className="text-label text-muted-foreground block mb-1">Envelope ID</label>
                        <p className="text-body font-mono text-sm">{viewingContract.envelopeId}</p>
                      </div>
                    )}
                  </div>

                  {/* Contract Document */}
                    <div className="pt-4 border-t border-border">
                    <label className="text-label text-muted-foreground block mb-3">Documents</label>
                    <div className="space-y-3">
                      {viewingContract.contractFileUrl && (() => {
                        const contractFileUrl = viewingContract.contractFileUrl;
                        const fileIdMatch = contractFileUrl?.match(/\/api\/files\/(\d+)/);
                        const downloadUrl = fileIdMatch 
                          ? `${contractFileUrl}?download=true`
                          : contractFileUrl;
                        
                        return (
                          <div className="border border-border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-6 h-6 text-red-600" />
                              <div>
                                <p className="font-medium">Contract PDF</p>
                                <p className="text-sm text-muted-foreground">Contract document</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={contractFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary transition-colors rounded-lg text-sm font-medium"
                        >
                                <ExternalLink className="w-4 h-4" />
                                View
                        </a>
                        <a
                                href={downloadUrl}
                                download="contract.pdf"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                                Download
                        </a>
                      </div>
                          </div>
                        );
                      })()}
                      
                      {/* All Documents for this Designer */}
                      {documents.filter(doc => doc.designerId === viewingContract.designerId).map((doc) => {
                        const fileIdMatch = doc.fileUrl?.match(/\/api\/files\/(\d+)/);
                        const downloadUrl = fileIdMatch 
                          ? `${doc.fileUrl}?download=true`
                          : doc.fileUrl;
                        const fileName = doc.fileName || doc.title || 'document';
                        
                        return (
                          <div key={doc.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-6 h-6 text-blue-600" />
                              <div>
                                <p className="font-medium">{doc.title}</p>
                                <p className="text-sm text-muted-foreground">{doc.description || doc.fileName}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary transition-colors rounded-lg text-sm font-medium"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View
                              </a>
                              <a
                                href={downloadUrl}
                                download={fileName}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg text-sm font-medium"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            </div>
                          </div>
                        );
                      })}
                      
                      {!viewingContract.contractFileUrl && documents.filter(doc => doc.designerId === viewingContract.designerId).length === 0 && (
                        <div className="border border-border rounded-lg p-4 text-center text-muted-foreground">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No documents available</p>
                    </div>
                  )}
                    </div>
                  </div>

                  {/* Envelope URL */}
                  {viewingContract.envelopeUrl && (
                    <div className="pt-4 border-t border-border">
                      <label className="text-label text-muted-foreground block mb-3">DocuSign Envelope</label>
                      <a
                        href={viewingContract.envelopeUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-border hover:bg-secondary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open in DocuSign</span>
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                    {viewingContract.status === "awarded" && viewingContract.envelopeStatus !== "completed" && (
                      <button
                        onClick={() => {
                          setShowContractDetailsModal(false);
                          if (viewingContract) {
                            handleSignContract(viewingContract);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
                      >
                        <FileSignature className="w-4 h-4" />
                        <span>SIGN CONTRACT</span>
                      </button>
                    )}
                    
                    {viewingContract.envelopeStatus === "completed" && (
                      <div className="flex items-center gap-2 text-green-600 px-6 py-3">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-body font-medium">Contract Signed Successfully</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}