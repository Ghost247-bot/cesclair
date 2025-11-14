"use client";

import { useState, useEffect, Suspense, lazy, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { SkeletonStats, SkeletonTable } from "@/components/skeleton-loaders";
import { 
  Shield, 
  Users, 
  Upload, 
  Check, 
  X, 
  Trash2,
  Package,
  Loader2,
  Search,
  Calendar,
  Mail,
  ExternalLink,
  FileText,
  UserCog,
  FileText as FileTextIcon,
  ChevronDown,
  Download,
  FolderOpen,
  Briefcase,
  Edit,
  BarChart3,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity
} from "lucide-react";
import { toast } from "sonner";

interface Designer {
  id: number;
  name: string;
  email: string;
  bio?: string;
  portfolioUrl?: string;
  specialties: string | null;
  status: string;
  avatarUrl?: string;
  bannerUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  stock?: number;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  membership?: {
    id: number;
    userId: string;
    tier: string;
    points: number;
    annualSpending: string;
    birthdayMonth?: number | null;
    birthdayDay?: number | null;
    joinedAt: string;
    lastTierUpdate: string;
  } | null;
}

interface Contract {
  id: number;
  designerId: number;
  designId?: number;
  title: string;
  description?: string;
  amount?: string;
  status: string;
  awardedAt?: string;
  completedAt?: string;
  createdAt: string;
  envelopeId?: string;
  envelopeStatus?: string;
  signedAt?: string;
  envelopeUrl?: string;
  contractFileUrl?: string;
  designer?: {
    id: number;
    name: string;
    email: string;
  };
}

interface AuditLog {
  id: number;
  action: string;
  performedBy: string;
  performedByName: string | null;
  performedByEmail: string | null;
  targetUserId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "designers" | "products" | "users" | "contracts" | "audit" | "portfolios" | "designs">("overview");
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalDesigners: 0,
    totalProducts: 0,
    totalContracts: 0,
    pendingDesigners: 0,
    pendingDesigns: 0,
    activeContracts: 0,
    recentActivity: [] as AuditLog[],
  });
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [filteredDesigners, setFilteredDesigners] = useState<Designer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [designs, setDesigns] = useState<Array<{ id: number; title: string; designerId: number }>>([]);
  const [selectedDesignerId, setSelectedDesignerId] = useState<number | null>(null);
  // Designs for review
  const [designsForReview, setDesignsForReview] = useState<Array<{
    id: number;
    designerId: number;
    title: string;
    description: string | null;
    imageUrl: string | null;
    category: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    designer: {
      id: number;
      name: string;
      email: string;
      bio: string | null;
      portfolioUrl: string | null;
      specialties: string | null;
      avatarUrl: string | null;
    };
  }>>([]);
  const [filteredDesignsForReview, setFilteredDesignsForReview] = useState<typeof designsForReview>([]);
  const [designSearchQuery, setDesignSearchQuery] = useState("");
  const [designStatusFilter, setDesignStatusFilter] = useState<string>("submitted");
  const [loading, setLoading] = useState(false);
  const [editingPointsUserId, setEditingPointsUserId] = useState<string | null>(null);
  const [editingSpendingUserId, setEditingSpendingUserId] = useState<string | null>(null);
  const [showTransactionsUploadModal, setShowTransactionsUploadModal] = useState(false);
  const [transactionsUploadUserId, setTransactionsUploadUserId] = useState<string | null>(null);
  const [uploadingTransactions, setUploadingTransactions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [changingRoleUserId, setChangingRoleUserId] = useState<string | null>(null);
  const [changingMembershipUserId, setChangingMembershipUserId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [contractSearchQuery, setContractSearchQuery] = useState("");
  const [contractStatusFilter, setContractStatusFilter] = useState<string>("all");
  const [portfolioSearchQuery, setPortfolioSearchQuery] = useState("");
  const [portfolioStatusFilter, setPortfolioStatusFilter] = useState<string>("all");
  
  // Debounced search queries
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedUserSearchQuery = useDebounce(userSearchQuery, 300);
  const debouncedProductSearchQuery = useDebounce(productSearchQuery, 300);
  const debouncedContractSearchQuery = useDebounce(contractSearchQuery, 300);
  const debouncedPortfolioSearchQuery = useDebounce(portfolioSearchQuery, 300);
  
  // Modal states
  const [showCreateDesignerModal, setShowCreateDesignerModal] = useState(false);
  const [showEditDesignerModal, setShowEditDesignerModal] = useState(false);
  const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);
  const [showEditContractModal, setShowEditContractModal] = useState(false);
  const [showContractDetailsModal, setShowContractDetailsModal] = useState(false);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [contractDocuments, setContractDocuments] = useState<any[]>([]);
  const [loadingContractDocuments, setLoadingContractDocuments] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductListView, setShowProductListView] = useState(true);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [uploadingDocumentForDesigner, setUploadingDocumentForDesigner] = useState<number | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [adminDocumentForm, setAdminDocumentForm] = useState({
    title: '',
    description: '',
    category: '',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    fileType: '',
    file: null as File | null,
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadedBannerUrl, setUploadedBannerUrl] = useState<string | null>(null);
  const [uploadingContractFile, setUploadingContractFile] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [uploadedContractFileUrl, setUploadedContractFileUrl] = useState<string | null>(null);

  const isAuthenticated = !sessionPending && session?.user;
  // Get role from session, may need to fetch from database if not in session
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  
  // Fetch user role if not in session
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user) {
        setRoleLoading(false);
        return;
      }
      
      // First check if role is in session
      const sessionRole = (session.user as any)?.role;
      if (sessionRole) {
        setUserRole(sessionRole);
        setRoleLoading(false);
        return;
      }
      
      // If not in session, fetch from database
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Fetching user role from API for user:', session.user.id);
        }
        const response = await fetch('/api/auth/check-role', {
          credentials: 'include',
          next: { revalidate: 300 }
        });
        if (response.ok) {
          const data = await response.json();
          if (process.env.NODE_ENV === 'development') {
            console.log('Role API response:', data);
          }
          const fetchedRole = data.role;
          if (fetchedRole) {
            setUserRole(fetchedRole);
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn('No role in API response, defaulting to member');
            }
            setUserRole('member');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          if (process.env.NODE_ENV === 'development') {
            console.error('Role API failed:', response.status, errorData);
          }
          setUserRole(null);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching user role:', error);
        }
        setUserRole(null);
      } finally {
        setRoleLoading(false);
      }
    };
    
    fetchUserRole();
  }, [session]);
  
  const isAdmin = userRole === "admin";
  const shouldShowContent = isAuthenticated && isAdmin && !roleLoading;

  // Debug logging (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(' Page State:', {
        sessionPending,
        roleLoading,
        hasSession: !!session,
        hasUser: !!session?.user,
        sessionRole: (session?.user as any)?.role,
        fetchedRole: userRole,
        isAdmin,
        shouldShowContent,
      });
    }
  }, [sessionPending, roleLoading, session, userRole, isAdmin, shouldShowContent]);

  // Fetch dashboard overview data
  const fetchDashboardOverview = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel for overview with caching
      const [usersRes, designersRes, productsRes, contractsRes, auditRes, designsRes] = await Promise.all([
        fetch("/api/admin/users?limit=100", { credentials: 'include', next: { revalidate: 60 } }),
        fetch("/api/designers?limit=50", { credentials: 'include', next: { revalidate: 60 } }),
        fetch("/api/products?limit=100", { credentials: 'include', next: { revalidate: 60 } }),
        fetch("/api/admin/contracts?limit=100", { credentials: 'include', next: { revalidate: 60 } }),
        fetch("/api/admin/audit-logs?limit=10", { credentials: 'include', next: { revalidate: 30 } }),
        fetch("/api/designs?status=submitted&limit=50", { credentials: 'include', next: { revalidate: 60 } }),
      ]);

      const usersData = usersRes.ok ? await usersRes.json() : [];
      const designersData = designersRes.ok ? await designersRes.json() : { designers: [] };
      const productsData = productsRes.ok ? await productsRes.json() : [];
      const contractsData = contractsRes.ok ? await contractsRes.json() : { contracts: [] };
      const auditData = auditRes.ok ? await auditRes.json() : { logs: [] };
      const designsData = designsRes.ok ? await designsRes.json() : [];

      const users = Array.isArray(usersData) ? usersData : [];
      const designers = Array.isArray(designersData) ? designersData : (designersData.designers || []);
      const products = Array.isArray(productsData) ? productsData : [];
      const contracts = Array.isArray(contractsData) ? contractsData : (contractsData.contracts || []);
      const auditLogs = Array.isArray(auditData) ? auditData : (auditData.logs || []);
      const designs = Array.isArray(designsData) ? designsData : [];

      setDashboardStats({
        totalUsers: users.length,
        totalDesigners: designers.length,
        totalProducts: products.length,
        totalContracts: contracts.length,
        pendingDesigners: designers.filter((d: Designer) => d.status === 'pending').length,
        pendingDesigns: designs.filter((d: any) => d.status === 'submitted').length,
        activeContracts: contracts.filter((c: Contract) => c.status === 'awarded' || c.status === 'pending').length,
        recentActivity: auditLogs.slice(0, 10),
      });

      // Also set the individual state for other tabs
      setUsers(users);
      setFilteredUsers(users);
      setDesigners(designers);
      setFilteredDesigners(designers);
      setProducts(products);
      setFilteredProducts(products);
      setContracts(contracts);
      setFilteredContracts(contracts);
      setDesignsForReview(designs);
      setFilteredDesignsForReview(designs);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to fetch dashboard overview:", error);
      }
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when admin is confirmed
  useEffect(() => {
    if (!sessionPending && !roleLoading && session?.user && isAdmin) {
      if (activeTab === "overview") {
        fetchDashboardOverview();
      } else if (activeTab === "designers") {
        fetchDesigners();
      } else if (activeTab === "users") {
        fetchUsers();
      } else if (activeTab === "products") {
        fetchProducts();
      } else if (activeTab === "contracts") {
        fetchContracts();
      } else if (activeTab === "audit") {
        fetchAuditLogs();
      } else if (activeTab === "portfolios") {
        fetchDesigners(); // Portfolios use the same data as designers
      } else if (activeTab === "designs") {
        fetchDesignsForReview();
      }
    }
  }, [sessionPending, roleLoading, session, isAdmin, activeTab]);

  // Fetch designs when contract modal opens or designer is selected
  useEffect(() => {
    const fetchDesigns = async () => {
      if (showCreateContractModal || showEditContractModal) {
        try {
          const url = selectedDesignerId 
            ? `/api/designs?designerId=${selectedDesignerId}&limit=500`
            : `/api/designs?limit=500`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            setDesigns(data.map((d: any) => ({ id: d.id, title: d.title, designerId: d.designerId })));
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
        console.error("Failed to fetch designs:", error);
      }
        }
      }
    };
    fetchDesigns();
  }, [showCreateContractModal, showEditContractModal, selectedDesignerId]);

  // Fetch designers when contract modal opens
  useEffect(() => {
    if ((showCreateContractModal || showEditContractModal) && designers.length === 0) {
      fetchDesigners();
    }
  }, [showCreateContractModal, showEditContractModal]);

  // Set selected designer when editing contract
  useEffect(() => {
    if (showEditContractModal && editingContract) {
      setSelectedDesignerId(editingContract.designerId);
    } else if (!showEditContractModal && !showCreateContractModal) {
      setSelectedDesignerId(null);
    }
  }, [showEditContractModal, editingContract, showCreateContractModal]);

  // Filter designers based on search and status (using debounced query)
  useEffect(() => {
    let filtered = designers;

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.email.toLowerCase().includes(query) ||
          (d.specialties && d.specialties.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    setFilteredDesigners(filtered);
  }, [designers, debouncedSearchQuery, statusFilter]);

  // Filter users based on search and role (using debounced query)
  useEffect(() => {
    let filtered = users;

    if (debouncedUserSearchQuery) {
      const query = debouncedUserSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, debouncedUserSearchQuery, roleFilter]);

  // Filter products based on search (using debounced query)
  useEffect(() => {
    let filtered = products;

    if (debouncedProductSearchQuery) {
      const query = debouncedProductSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [products, debouncedProductSearchQuery]);

  // Filter contracts based on search and status (using debounced query)
  useEffect(() => {
    let filtered = contracts;

    if (debouncedContractSearchQuery) {
      const query = debouncedContractSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query) ||
          c.designer?.name.toLowerCase().includes(query)
      );
    }

    if (contractStatusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === contractStatusFilter);
    }

    setFilteredContracts(filtered);
  }, [contracts, debouncedContractSearchQuery, contractStatusFilter]);

  // Filter designs based on search and status
  useEffect(() => {
    let filtered = designsForReview;

    if (designSearchQuery) {
      const query = designSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.description?.toLowerCase().includes(query) ||
          d.category?.toLowerCase().includes(query) ||
          d.designer?.name.toLowerCase().includes(query) ||
          d.designer?.email.toLowerCase().includes(query)
      );
    }

    if (designStatusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === designStatusFilter);
    }

    setFilteredDesignsForReview(filtered);
  }, [designsForReview, designSearchQuery, designStatusFilter]);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/designers?limit=50", {
        credentials: 'include',
        next: { revalidate: 60 }
      });
      if (response.ok) {
        const data = await response.json();
        const designersList = data.designers || data;
        setDesigners(designersList);
        setFilteredDesigners(designersList);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error || "Failed to load designers";
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to fetch designers:", errorData);
        }
          toast.error(errorMessage);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to fetch designers:", error);
      }
      toast.error("Failed to load designers. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const updateDesignerStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/designers?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setDesigners(
          designers.map((d) => (d.id === id ? { ...d, status } : d))
        );
        toast.success(`Designer ${status === "approved" ? "approved" : "rejected"} successfully`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update designer status");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update designer status:", error);
      }
      toast.error("Failed to update designer status");
    }
  };

  const fetchDesignsForReview = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/designs?limit=100", {
        credentials: 'include',
        next: { revalidate: 60 }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        const errorMessage = errorData?.error || `Failed to load designs: ${response.status} ${response.statusText}`;
        if (process.env.NODE_ENV === 'development') {
          if (process.env.NODE_ENV === 'development') {
          console.error("Failed to fetch designs:", errorData);
        }
        }
        toast.error(errorMessage);
        setDesignsForReview([]);
        setFilteredDesignsForReview([]);
        return;
      }
      
      const data = await response.json();
      const designsList = Array.isArray(data) ? data : [];
      
      // Ensure all designs have the required structure with designer information
      const formattedDesigns = designsList.map((design: any) => ({
        id: design.id,
        designerId: design.designerId,
        title: design.title,
        description: design.description || null,
        imageUrl: design.imageUrl || null,
        category: design.category || null,
        status: design.status || 'draft',
        createdAt: design.createdAt ? new Date(design.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: design.updatedAt ? new Date(design.updatedAt).toISOString() : new Date().toISOString(),
        designer: design.designer || {
          id: design.designerId,
          name: 'Unknown Designer',
          email: '',
          bio: null,
          portfolioUrl: null,
          specialties: null,
          avatarUrl: null,
        },
      }));
      
      setDesignsForReview(formattedDesigns);
      setFilteredDesignsForReview(formattedDesigns);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
        console.error("Failed to fetch designs:", error);
      }
      }
      toast.error("Failed to load designs. Please check your connection.");
      setDesignsForReview([]);
      setFilteredDesignsForReview([]);
    } finally {
      setLoading(false);
    }
  };

  const updateDesignStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/designs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setDesignsForReview(
          designsForReview.map((d) => (d.id === id ? { ...d, status } : d))
        );
        // Update dashboard stats if needed
        if (activeTab === "overview") {
          fetchDashboardOverview();
        }
        toast.success(`Design ${status === "approved" ? "approved" : "rejected"} successfully`);
        // Refresh the designs list
        await fetchDesignsForReview();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update design status");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update design status:", error);
      }
      toast.error("Failed to update design status");
    }
  };

  const deleteDesigner = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this designer? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/designers/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (response.ok) {
        setDesigners(designers.filter((d) => d.id !== id));
        toast.success("Designer deleted successfully");
      } else {
        toast.error("Failed to delete designer");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to delete designer:", error);
      }
      toast.error("Failed to delete designer");
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('file', file);
      // Include designer ID if editing an existing designer
      if (editingDesigner?.id) {
        formData.append('designerId', editingDesigner.id.toString());
      }

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
      setUploadedAvatarUrl(data.url);

      toast.success('Avatar uploaded successfully');
      return data.url;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Avatar upload error:', error);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    try {
      setUploadingBanner(true);
      const formData = new FormData();
      formData.append('file', file);
      // Include designer ID if editing an existing designer
      if (editingDesigner?.id) {
        formData.append('designerId', editingDesigner.id.toString());
      }

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
      setUploadedBannerUrl(data.url);

      toast.success('Banner image uploaded successfully');
      return data.url;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Banner upload error:', error);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to upload banner');
      throw error;
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleAdminDocumentUpload = async (file: File) => {
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
      setAdminDocumentForm(prev => ({ 
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

  const handleAdminDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdminDocumentForm(prev => ({ ...prev, file }));
      handleAdminDocumentUpload(file);
    }
  };

  const handleSaveAdminDocument = async () => {
    if (!uploadingDocumentForDesigner || !session?.user) return;

    if (!adminDocumentForm.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!adminDocumentForm.fileUrl) {
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
          designerId: uploadingDocumentForDesigner,
          uploadedBy: session.user.id, // Admin user ID
          title: adminDocumentForm.title.trim(),
          description: adminDocumentForm.description.trim() || null,
          category: adminDocumentForm.category.trim() || null,
          fileName: adminDocumentForm.fileName,
          fileUrl: adminDocumentForm.fileUrl,
          fileSize: adminDocumentForm.fileSize,
          fileType: adminDocumentForm.fileType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save document');
      }

      toast.success('Document uploaded successfully for designer');
      setShowUploadDocumentModal(false);
      setUploadingDocumentForDesigner(null);
      setAdminDocumentForm({
        title: '',
        description: '',
        category: '',
        fileUrl: '',
        fileName: '',
        fileSize: 0,
        fileType: '',
        file: null,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Save document error:', error);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to save document');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users?limit=500", {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
        setFilteredUsers(data || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to load users:", response.status, errorData);
        }
        toast.error(errorData.error || "Failed to load users");
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to fetch users:", error);
      }
      toast.error("Failed to load users. Please try again.");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      setChangingRoleUserId(userId);
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        toast.success(`User role updated to ${newRole}`);
        // Refresh audit logs to show the new entry
        if (activeTab === "audit") {
          fetchAuditLogs();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update user role");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update user role:", error);
      }
      toast.error("Failed to update user role");
    } finally {
      setChangingRoleUserId(null);
    }
  };

  const updateMembershipTier = async (userId: string, newTier: string) => {
    if (!window.confirm(`Are you sure you want to upgrade this user's membership to ${newTier.toUpperCase()}?`)) {
      return;
    }

    try {
      setChangingMembershipUserId(userId);
      const response = await fetch(`/api/admin/users/${userId}/membership`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ tier: newTier }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(users.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              membership: data.membership,
            };
          }
          return u;
        }));
        toast.success(`Membership upgraded to ${newTier.toUpperCase()}`);
        // Refresh audit logs to show the new entry
        if (activeTab === "audit") {
          fetchAuditLogs();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update membership tier");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update membership tier:", error);
      }
      toast.error("Failed to update membership tier");
    } finally {
      setChangingMembershipUserId(null);
    }
  };

  const updatePointsAndSpending = async (userId: string, points?: number, annualSpending?: string) => {
    try {
      setEditingPointsUserId(userId);
      const response = await fetch(`/api/admin/users/${userId}/membership/points`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ 
          ...(points !== undefined && { points }),
          ...(annualSpending !== undefined && { annualSpending }),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(users.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              membership: data.membership,
            };
          }
          return u;
        }));
        toast.success("Points and spending updated successfully");
        // Refresh audit logs to show the new entry
        if (activeTab === "audit") {
          fetchAuditLogs();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update points and spending");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update points and spending:", error);
      }
      toast.error("Failed to update points and spending");
    } finally {
      setEditingPointsUserId(null);
      setEditingSpendingUserId(null);
    }
  };

  const handleTransactionsCSVUpload = async (userId: string, file: File) => {
    try {
      setUploadingTransactions(true);
      const text = await file.text();
      
      const response = await fetch(`/api/admin/users/${userId}/transactions/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ csvContent: text }),
      });

      if (response.ok || response.status === 207) {
        const data = await response.json();
        // Update user's membership data
        setUsers(users.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              membership: data.membership,
            };
          }
          return u;
        }));
        
        if (data.errors && data.errors.length > 0) {
          toast.warning(`Uploaded ${data.transactionsCreated} transactions with ${data.errors.length} errors`);
          if (process.env.NODE_ENV === 'development') {
            console.error("Transaction errors:", data.errors);
          }
        } else {
          toast.success(`Successfully uploaded ${data.transactionsCreated} transactions`);
        }
        
        setShowTransactionsUploadModal(false);
        setTransactionsUploadUserId(null);
        
        // Refresh audit logs to show the new entry
        if (activeTab === "audit") {
          fetchAuditLogs();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to upload transactions");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to upload transactions:", error);
      }
      toast.error("Failed to upload transactions");
    } finally {
      setUploadingTransactions(false);
    }
  };

  const downloadTransactionsCSVTemplate = () => {
    const csvContent = `type,amount,points,description,orderId,createdAt
purchase,125.50,125,Purchase - Order #ORD-10001,ORD-10001,2024-01-20T14:30:00.000Z
purchase,89.99,90,Purchase - Order #ORD-10045,ORD-10045,2024-02-15T11:20:00.000Z
redeem,10.00,-100,Redeemed 100 points for $10 off,,
bonus,0.00,50,Birthday bonus points,,
refund,25.00,-25,Refund for Order #ORD-10001,ORD-10001,2024-01-25T10:00:00.000Z`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products?limit=500", {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data || []);
        setFilteredProducts(data || []);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to fetch products:", error);
      }
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/contracts?limit=500", {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both array and object with contracts property
        const contractsList = Array.isArray(data) ? data : (data?.contracts || []);
        setContracts(contractsList);
        setFilteredContracts(contractsList);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to load contracts");
        setContracts([]);
        setFilteredContracts([]);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to fetch contracts:", error);
      }
      toast.error("Failed to load contracts. Please check your connection.");
      setContracts([]);
      setFilteredContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/audit-logs?limit=100", {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to load audit logs:", response.status, errorData);
        }
        toast.error(errorData.error || "Failed to load audit logs");
        setAuditLogs([]);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to fetch audit logs:", error);
      }
      toast.error("Failed to load audit logs. Please try again.");
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContractDocuments = async (designerId: number, contractId: number) => {
    try {
      setLoadingContractDocuments(true);
      // Fetch ALL documents for the designer, not just category=contract
      const response = await fetch(`/api/documents?designerId=${designerId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setContractDocuments(data || []);
      } else {
        setContractDocuments([]);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to fetch contract documents:", error);
      }
      setContractDocuments([]);
    } finally {
      setLoadingContractDocuments(false);
    }
  };

  const createDesigner = async (designerData: {
    name: string;
    email: string;
    password: string;
    bio?: string;
    portfolioUrl?: string;
    specialties?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    status?: string;
  }) => {
    try {
      const response = await fetch("/api/admin/designers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(designerData),
      });

      if (response.ok) {
        const newDesigner = await response.json();
        setDesigners([newDesigner, ...designers]);
        toast.success("Designer created successfully");
        setShowCreateDesignerModal(false);
        fetchDesigners();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create designer");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to create designer:", error);
      }
      toast.error("Failed to create designer");
    }
  };

  const updateDesignerDetails = async (id: number, updates: Partial<Designer> & { password?: string }) => {
    try {
      const response = await fetch(`/api/admin/designers?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updated = await response.json();
        setDesigners(designers.map((d) => (d.id === id ? updated : d)));
        toast.success("Designer updated successfully");
        setShowEditDesignerModal(false);
        setEditingDesigner(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update designer");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update designer:", error);
      }
      toast.error("Failed to update designer");
    }
  };

  const createUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    emailVerified?: boolean;
  }) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([newUser, ...users]);
        toast.success("User created successfully");
        setShowCreateUserModal(false);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create user");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to create user:", error);
      }
      toast.error("Failed to create user");
    }
  };

  const verifyUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PUT",
        credentials: 'include',
      });

      if (response.ok) {
        const updated = await response.json();
        setUsers(users.map((u) => (u.id === userId ? updated : u)));
        toast.success("User verified successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to verify user");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to verify user:", error);
      }
      toast.error("Failed to verify user");
    }
  };

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updated = await response.json();
        setProducts(products.map((p) => (p.id === id ? updated : p)));
        toast.success("Product updated successfully");
        setShowEditProductModal(false);
        setEditingProduct(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update product");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update product:", error);
      }
      toast.error("Failed to update product");
    }
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
        toast.success("Product deleted successfully");
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to delete product:", error);
      }
      toast.error("Failed to delete product");
    }
  };

  const bulkDeleteProducts = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/products/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ productIds: selectedProducts }),
      });

      if (response.ok) {
        setProducts(products.filter((p) => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
        toast.success(`Successfully deleted ${selectedProducts.length} product(s)`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete products");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to bulk delete products:", error);
      }
      toast.error("Failed to delete products");
    }
  };

  const handleContractFileUpload = async (file: File) => {
    try {
      setUploadingContractFile(true);
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
      setUploadedContractFileUrl(data.url);
      toast.success('Contract file uploaded successfully');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Upload error:', error);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to upload contract file');
    } finally {
      setUploadingContractFile(false);
    }
  };

  const handleContractFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContractFile(file);
      handleContractFileUpload(file);
    }
  };

  const createContract = async (contractData: {
    designerId: number;
    designId?: number;
    title: string;
    description?: string;
    amount?: string;
    status?: string;
    contractFileUrl?: string;
  }) => {
    try {
      const response = await fetch("/api/admin/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(contractData),
      });

      if (response.ok) {
        const newContract = await response.json();
        const updatedContracts = [newContract, ...contracts];
        setContracts(updatedContracts);
        setFilteredContracts(updatedContracts);
        toast.success("Contract created successfully");
        setShowCreateContractModal(false);
        setSelectedDesignerId(null);
        // Refresh dashboard stats if on overview tab
        if (activeTab === "overview") {
          fetchDashboardOverview();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create contract");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to create contract:", error);
      }
      toast.error("Failed to create contract");
    }
  };

  const updateContract = async (id: number, updates: any) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Updating contract:", id, updates);
      }
      const response = await fetch(`/api/admin/contracts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updated = await response.json();
        const updatedContracts = contracts.map((c) => (c.id === id ? updated : c));
        setContracts(updatedContracts);
        setFilteredContracts(updatedContracts);
        // Update viewing contract if it's the same one
        if (viewingContract && viewingContract.id === id) {
          setViewingContract(updated);
        }
        toast.success("Contract updated successfully");
        setShowEditContractModal(false);
        setEditingContract(null);
        setSelectedDesignerId(null);
        // Refresh dashboard stats if on overview tab
        if (activeTab === "overview") {
          fetchDashboardOverview();
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        if (process.env.NODE_ENV === 'development') {
          console.error("Update contract error:", errorData);
        }
        toast.error(errorData.error || `Failed to update contract: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update contract:", error);
      }
      toast.error(error instanceof Error ? error.message : "Failed to update contract");
    }
  };

  const deleteContract = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this contract? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/contracts/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (response.ok) {
        const updatedContracts = contracts.filter((c) => c.id !== id);
        setContracts(updatedContracts);
        setFilteredContracts(updatedContracts);
        toast.success("Contract deleted successfully");
        // Refresh dashboard stats if on overview tab
        if (activeTab === "overview") {
          fetchDashboardOverview();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to delete contract");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to delete contract:", error);
      }
      toast.error("Failed to delete contract");
    }
  };

  // CSV parser that handles quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    return result;
  };

  // Download CSV template
  const downloadCSVTemplate = () => {
    // Full CSV format matching fashion.csv structure
    const headers = [
      'Tile-image Image',
      'Product-tile__anchor URL',
      'Product-tile__body-section',
      'Price',
      'Price',
      'Tile-image Description',
      'Swatch__icon--color Image',
      'Swatch__icon--color Image',
      'Product-tile__colors-counter',
      'Product-tile__swatch URL',
      'Swatch__icon--color Description',
      'Product-tile__swatch (2) URL',
      'Swatch__icon--color Description',
      'Product-tile__color_count_mobile',
      'Swatch__icon--color Image',
      'Product-tile__swatch (3) URL',
      'Swatch__icon--color Description',
      'Swatch__icon--color Image',
      'Product-tile__swatch (4) URL',
      'Swatch__icon--color Description'
    ];
    
    // Example row with required fields (first 6 columns are used for product data)
    const exampleRow = [
      'https://media.example.com/image/w_600/product.json',
      'https://www.example.com/products/product-name/12345ABC.html',
      'Example Product Name',
      '$99.00',
      '99.00',
      'Example product description',
      '', // Swatch images and additional columns are optional
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ];
    
    const csvContent = [
      headers.join(','),
      exampleRow.map(val => val ? `"${val}"` : '').join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'products-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      if (lines.length < 2) {
        setUploadResult("CSV file must contain at least a header row and one data row.");
        toast.error("Invalid CSV file");
        return;
      }

      // Parse header row
      const headers = parseCSVLine(lines[0]);
      const products: Product[] = [];

      // Check if this is the new Blm-product-search format
      const isBlmFormat = headers.length >= 9 && (
        headers[0]?.includes('Blm-product-search-image-container__image Image') ||
        headers[0]?.includes('Blm-product-search') ||
        headers[4]?.includes('Title') ||
        headers[8]?.includes('Price')
      );

      // Check if this is the fashion.csv format (has specific column names)
      // Detects format by checking for key header names
      const isFashionFormat = !isBlmFormat && headers.length >= 6 && (
        headers[0]?.includes('Tile-image Image') || headers[0]?.includes('Tile-image') ||
        headers[1]?.includes('Product-tile__anchor URL') || headers[1]?.includes('Product-tile') ||
        headers[2]?.includes('Product-tile__body-section') || headers[2]?.includes('Product-tile') ||
        headers[5]?.includes('Tile-image Description') || headers[5]?.includes('Description')
      );

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);
        
        let product: any = {};

        if (isBlmFormat) {
          // Map Blm-product-search format to product schema
          // Columns:
          // 0: Blm-product-search-image-container__image Image (first image URL)
          // 1: Blm-product-search-image-container__image (2) Image (second image URL, optional)
          // 2: Blm-product-search-container URL (product URL)
          // 3: Blm-product-search-image-container__image Description (SKU/slug)
          // 4: Title (product name) - REQUIRED
          // 5: Span (badge text like "New", "Selling Fast", "29% Off", etc.)
          // 6: Blm-product-search-badge (usually empty)
          // 7: Blm-product-search-sustainability (sustainability tags)
          // 8: Price (current price with $) - REQUIRED
          // 9: (Optional) Original price when on sale
          
          const imageUrl = values[0]?.replace(/^"|"$/g, '').trim() || '';
          const secondImageUrl = values[1]?.replace(/^"|"$/g, '').trim() || '';
          const productUrl = values[2]?.replace(/^"|"$/g, '').trim() || '';
          const skuSlug = values[3]?.replace(/^"|"$/g, '').trim() || '';
          const name = values[4]?.replace(/^"|"$/g, '').trim() || '';
          const badge = values[5]?.replace(/^"|"$/g, '').trim() || '';
          const sustainability = values[7]?.replace(/^"|"$/g, '').trim() || '';
          const priceStr = values[8]?.replace(/^"|"$/g, '').trim() || '';
          const originalPriceStr = values[9]?.replace(/^"|"$/g, '').trim() || '';
          
          // Clean price - remove $ and commas
          let price = priceStr.replace(/[$,]/g, '').trim();
          
          // Validate price is a valid number
          const priceNum = parseFloat(price);
          if (isNaN(priceNum) || priceNum < 0) {
            // Skip this product if price is invalid
            continue;
          }
          
          // Extract SKU from slug or URL
          let sku: string | undefined;
          if (skuSlug) {
            // Use the slug as SKU (e.g., "mens-cashmere-crew-heathered-mahogany")
            sku = skuSlug;
          } else if (productUrl) {
            // Extract from URL if slug not available
            const urlParts = productUrl.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart) {
              sku = lastPart.replace('.html', '');
            }
          }
          
          // Extract category from URL if possible (optional)
          let category: string | undefined;
          if (productUrl) {
            // Try to extract category from URL path
            const urlParts = productUrl.split('/');
            const productsIndex = urlParts.findIndex(part => part === 'products');
            if (productsIndex !== -1 && urlParts[productsIndex + 1]) {
              const productPath = urlParts[productsIndex + 1];
              // Extract category from product path (e.g., "mens-cashmere-crew" -> "sweaters" or "mens")
              // For now, we'll try to infer from the path
              if (productPath.includes('mens-')) {
                category = undefined; // Could set to "mens" or specific category
              } else if (productPath.includes('womens-')) {
                category = undefined; // Could set to "womens" or specific category
              }
            }
          }
          
          // Build description from sustainability tags and badge
          let description: string | undefined;
          const descriptionParts: string[] = [];
          if (badge) {
            descriptionParts.push(`Badge: ${badge}`);
          }
          if (sustainability) {
            descriptionParts.push(`Sustainability: ${sustainability}`);
          }
          if (descriptionParts.length > 0) {
            description = descriptionParts.join('. ');
          }
          
          // Use first image URL, fallback to second if first is empty
          const finalImageUrl = imageUrl || secondImageUrl;
          
          if (name && name.trim() && price && price.trim()) {
            product = {
              name: name.trim(),
              price: price, // Keep as string for API
              description: description || undefined,
              imageUrl: finalImageUrl || undefined,
              category: category,
              sku: sku || undefined,
              stock: 0, // Default stock
            };
          }
        } else if (isFashionFormat) {
          // Map fashion.csv format to product schema
          // This format supports up to 20 columns, but only first 6 are used for product data:
          // 0: Tile-image Image (product image URL)
          // 1: Product-tile__anchor URL (product URL, used to extract SKU)
          // 2: Product-tile__body-section (product name) - REQUIRED
          // 3: Price (with $ symbol)
          // 4: Price (numeric only) - REQUIRED
          // 5: Tile-image Description (product description)
          // 6-19: Additional swatch/color data (optional, not used for product creation)
          
          const imageUrl = values[0]?.replace(/^"|"$/g, '') || '';
          const productUrl = values[1]?.replace(/^"|"$/g, '') || '';
          const name = values[2]?.replace(/^"|"$/g, '') || '';
          const priceWithDollar = values[3]?.replace(/^"|"$/g, '').trim() || '';
          const priceWithoutDollar = values[4]?.replace(/^"|"$/g, '').trim() || '';
          const description = values[5]?.replace(/^"|"$/g, '') || '';
          
          // Extract price (prefer the one without $, or remove $ from the one with $)
          let price = priceWithoutDollar || priceWithDollar.replace('$', '').trim();
          
          // Clean up price - remove commas and $ signs
          price = price.replace(/[$,]/g, '').trim();
          
          // Validate price is a valid number
          const priceNum = parseFloat(price);
          if (isNaN(priceNum) || priceNum < 0) {
            // Skip this product if price is invalid
            continue;
          }
          
          // Extract category from URL if possible (optional)
          let category: string | undefined;
          if (productUrl) {
            // Try to extract category from URL path
            const urlParts = productUrl.split('/');
            const productsIndex = urlParts.findIndex(part => part === 'products');
            if (productsIndex !== -1 && urlParts[productsIndex + 1]) {
              // Could use product type as category, but for now leave it null
              category = undefined;
            }
          }
          
          // Generate SKU from product URL or name if available
          let sku: string | undefined;
          if (productUrl) {
            // Extract SKU from URL (e.g., /products/cove-cashmere-oversized-crew/1316169WYM.html)
            const skuMatch = productUrl.match(/\/(\d+[A-Z]+)\.html/);
            if (skuMatch) {
              sku = skuMatch[1];
            }
          }
          
          if (name && name.trim() && price && price.trim()) {
            product = {
              name: name.trim(),
              price: price, // Keep as string for API
              description: description.trim() || undefined,
              imageUrl: imageUrl || undefined,
              category: category,
              sku: sku,
              stock: 0, // Default stock
            };
          }
        } else {
          // Legacy format: map headers to product fields
          headers.forEach((header, index) => {
            if (values[index]) {
              const cleanValue = values[index].replace(/^"|"$/g, '');
              // Map common header names to product fields
              const headerLower = header.toLowerCase();
              if (headerLower.includes('name') || headerLower === 'product name') {
                product.name = cleanValue;
              } else if (headerLower.includes('price')) {
                product.price = cleanValue.replace(/[$,]/g, '').trim();
              } else if (headerLower.includes('description')) {
                product.description = cleanValue;
              } else if (headerLower.includes('image') || headerLower.includes('url')) {
                product.imageUrl = cleanValue;
              } else if (headerLower.includes('category')) {
                product.category = cleanValue;
              } else if (headerLower.includes('sku')) {
                product.sku = cleanValue;
              } else if (headerLower.includes('stock')) {
                product.stock = parseInt(cleanValue) || 0;
              } else {
                // Fallback: use header name as key
                product[header] = cleanValue;
              }
            }
          });
        }

        // Validate product has required fields and valid price
        if (product.name && product.name.trim() && product.price && product.price.trim()) {
          // Validate price is a valid number
          const priceNum = parseFloat(product.price);
          if (!isNaN(priceNum) && priceNum >= 0) {
            products.push(product);
          }
        }
      }

      if (products.length === 0) {
        setUploadResult("No valid products found in CSV file. Make sure the file contains 'name' and 'price' fields.");
        toast.error("No valid products found");
        return;
      }

      // Debug: Log products being sent
      if (process.env.NODE_ENV === 'development') {
        console.log("Products to upload:", products);
        console.log("Products count:", products.length);
      }

      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ products }),
      });

      const data = await response.json();

      if (response.ok || response.status === 207) {
        // 207 is Multi-Status (partial success)
        const failedMsg = data.failed > 0 ? `${data.failed} failed.` : "";
        const errorDetails = data.errors && data.errors.length > 0 
          ? `\nErrors: ${data.errors.map((e: any) => e.error).join(', ')}`
          : "";
        setUploadResult(`Successfully uploaded ${data.created} products. ${failedMsg}${errorDetails}`);
        if (data.created > 0) {
          toast.success(`Successfully uploaded ${data.created} product(s)`);
        }
        if (data.failed > 0) {
          toast.warning(`${data.failed} product(s) failed to upload`);
        }
        // Refresh the products list
        await fetchProducts();
        // Switch to list view to see the uploaded products
        setShowProductListView(true);
      } else {
        const errorMsg = data.error || data.message || "Unknown error";
        const errorDetails = data.errors && data.errors.length > 0 
          ? `\nErrors: ${data.errors.map((e: any) => e.error).join(', ')}`
          : "";
        setUploadResult(`Upload failed: ${errorMsg}${errorDetails}`);
        toast.error(`Upload failed: ${errorMsg}`);
        if (process.env.NODE_ENV === 'development') {
          console.error("Upload error details:", data);
        }
      }
    } catch (error) {
      setUploadResult(`Upload error: ${error instanceof Error ? error.message : "Unknown error"}`);
      toast.error("Upload error");
      if (process.env.NODE_ENV === 'development') {
        console.error("CSV upload error:", error);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (sessionPending || roleLoading) return; // Wait for session and role to load
    
    if (!session?.user) {
      router.push("/cesworld/login");
      return;
    }
    
    // Only redirect if we've confirmed the role is not admin
    if (userRole && userRole !== "admin") {
      console.log('User is not admin, role:', userRole, 'Redirecting to homepage');
      router.push("/");
      return;
    }
  }, [sessionPending, roleLoading, session, userRole, router]);

  // Handle loading and authentication states
  if (sessionPending || roleLoading) {
    return (
      <>
        <HeaderNavigation />
        <div className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-xs md:text-body text-muted-foreground">Loading admin panel...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!session?.user) {
    return (
      <>
        <HeaderNavigation />
        <div className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-xs md:text-body text-muted-foreground">Redirecting...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!roleLoading && userRole !== null && userRole !== "admin") {
    return (
      <>
        <HeaderNavigation />
        <div className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-xs md:text-body text-muted-foreground">Redirecting...</p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-muted-foreground mt-2">Role: {userRole}</p>
            )}
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (!roleLoading && userRole === null && session?.user) {
    return (
      <>
        <HeaderNavigation />
        <div className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-muted-foreground" />
            <h2 className="text-lg md:text-2xl font-medium mb-1 md:mb-2">Unable to Verify Role</h2>
            <p className="text-xs md:text-body text-muted-foreground mb-2 md:mb-4">
              Could not verify your admin status. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (!isAdmin) {
    return (
      <>
        <HeaderNavigation />
        <div className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-xs md:text-body text-muted-foreground">Loading admin panel...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeaderNavigation />
      <main className="pt-[48px] sm:pt-[51px] md:pt-[54px] lg:pt-[57px] min-h-screen bg-background">
        {/* Header Section */}
        <section className="bg-white border-b border-border">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-10">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-1 sm:mb-1.5 md:mb-2">
              <div className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 bg-primary/10 rounded-lg">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium">Admin Dashboard</h1>
                <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-muted-foreground mt-0.5 sm:mt-0.75 md:mt-1">
                  Manage users, designers, products, and view audit logs
                </p>
              </div>
            </div>
            {session?.user && (
              <div className="mt-1.5 sm:mt-2 md:mt-3 lg:mt-4 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                Logged in as <span className="font-medium text-foreground">{session.user.email}</span>
              </div>
            )}
          </div>
        </section>

        {/* Tabs Navigation */}
        <section className="bg-white border-b border-border sticky top-[48px] sm:top-[51px] md:top-[54px] lg:top-[57px] z-10">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex gap-0.5 sm:gap-0.75 md:gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 md:py-3 lg:py-3.5 xl:py-4 text-[10px] sm:text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <BarChart3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 inline mr-0.75 sm:mr-1 md:mr-1.5 lg:mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 md:py-3 lg:py-3.5 xl:py-4 text-[10px] sm:text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "users"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <UserCog className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 inline mr-0.75 sm:mr-1 md:mr-1.5 lg:mr-2" />
                <span className="hidden sm:inline">Users </span>({users.length})
              </button>
              <button
                onClick={() => setActiveTab("designers")}
                className={`px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 md:py-3 lg:py-3.5 xl:py-4 text-[10px] sm:text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "designers"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 inline mr-0.75 sm:mr-1 md:mr-1.5 lg:mr-2" />
                <span className="hidden sm:inline">Designers </span>({designers.length})
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 md:py-3 lg:py-3.5 xl:py-4 text-[10px] sm:text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "products"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 inline mr-0.75 sm:mr-1 md:mr-1.5 lg:mr-2" />
                <span className="hidden sm:inline">Products </span>({products.length})
              </button>
              <button
                onClick={() => setActiveTab("contracts")}
                className={`px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 md:py-3 lg:py-3.5 xl:py-4 text-[10px] sm:text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "contracts"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 inline mr-0.75 sm:mr-1 md:mr-1.5 lg:mr-2" />
                <span className="hidden sm:inline">Contracts </span>({contracts.length})
              </button>
              <button
                onClick={() => setActiveTab("designs")}
                className={`px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 md:py-3 lg:py-3.5 xl:py-4 text-[10px] sm:text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "designs"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Upload className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 inline mr-0.75 sm:mr-1 md:mr-1.5 lg:mr-2" />
                <span className="hidden sm:inline">Designs </span>
                {designsForReview.filter((d) => d.status === "submitted").length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {designsForReview.filter((d) => d.status === "submitted").length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 md:py-3 lg:py-3.5 xl:py-4 text-[10px] sm:text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "audit"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <FileTextIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 inline mr-0.75 sm:mr-1 md:mr-1.5 lg:mr-2" />
                <span className="hidden sm:inline">Audit Logs</span>
                <span className="sm:hidden">Audit</span>
              </button>
              <button
                onClick={() => setActiveTab("portfolios")}
                className={`px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 md:py-3 lg:py-3.5 xl:py-4 text-[10px] sm:text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "portfolios"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 inline mr-0.75 sm:mr-1 md:mr-1.5 lg:mr-2" />
                <span className="hidden sm:inline">Portfolios </span>({designers.filter(d => d.status === "approved").length})
              </button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-3 sm:py-4 md:py-6 lg:py-8 xl:py-10">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                {loading ? (
                  <SkeletonStats />
                ) : (
                  <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                      {/* Total Users Card */}
                      <div className="bg-white border border-border rounded-lg p-2.5 sm:p-3 md:p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3 lg:mb-4">
                          <div className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 bg-blue-100 rounded-lg">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-blue-600" />
                          </div>
                          <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-green-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-0.75 md:mb-1">{dashboardStats.totalUsers}</h3>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Total Users</p>
                        <div className="mt-1.5 sm:mt-2 md:mt-3 lg:mt-4 pt-1.5 sm:pt-2 md:pt-3 lg:pt-4 border-t border-border">
                          <div className="flex justify-between text-[9px] sm:text-[10px] md:text-xs">
                            <span className="text-muted-foreground">Members: {users.filter(u => u.role === 'member').length}</span>
                            <span className="text-muted-foreground">Admins: {users.filter(u => u.role === 'admin').length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Total Designers Card */}
                      <div className="bg-white border border-border rounded-lg p-2.5 sm:p-3 md:p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3 lg:mb-4">
                          <div className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 bg-purple-100 rounded-lg">
                            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-purple-600" />
                          </div>
                          {dashboardStats.pendingDesigners > 0 && (
                            <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-orange-500" />
                          )}
                        </div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-0.75 md:mb-1">{dashboardStats.totalDesigners}</h3>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Total Designers</p>
                        <div className="mt-1.5 sm:mt-2 md:mt-3 lg:mt-4 pt-1.5 sm:pt-2 md:pt-3 lg:pt-4 border-t border-border">
                          <div className="flex justify-between text-[9px] sm:text-[10px] md:text-xs">
                            <span className="text-muted-foreground">Approved: {designers.filter(d => d.status === 'approved').length}</span>
                            <span className="text-orange-600 font-medium">Pending: {dashboardStats.pendingDesigners}</span>
                          </div>
                        </div>
                      </div>

                      {/* Total Products Card */}
                      <div className="bg-white border border-border rounded-lg p-2.5 sm:p-3 md:p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3 lg:mb-4">
                          <div className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 bg-green-100 rounded-lg">
                            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-green-600" />
                          </div>
                          <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-green-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-0.75 md:mb-1">{dashboardStats.totalProducts}</h3>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Total Products</p>
                        <div className="mt-1.5 sm:mt-2 md:mt-3 lg:mt-4 pt-1.5 sm:pt-2 md:pt-3 lg:pt-4 border-t border-border">
                          <div className="flex justify-between text-[9px] sm:text-[10px] md:text-xs">
                            <span className="text-muted-foreground">In Stock: {products.filter(p => (p.stock || 0) > 0).length}</span>
                            <span className="text-muted-foreground">Out of Stock: {products.filter(p => (p.stock || 0) === 0).length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Total Contracts Card */}
                      <div className="bg-white border border-border rounded-lg p-2.5 sm:p-3 md:p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3 lg:mb-4">
                          <div className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 bg-orange-100 rounded-lg">
                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-orange-600" />
                          </div>
                          <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-blue-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-0.75 md:mb-1">{dashboardStats.totalContracts}</h3>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Total Contracts</p>
                        <div className="mt-1.5 sm:mt-2 md:mt-3 lg:mt-4 pt-1.5 sm:pt-2 md:pt-3 lg:pt-4 border-t border-border">
                          <div className="flex justify-between text-[9px] sm:text-[10px] md:text-xs">
                            <span className="text-green-600 font-medium">Active: {dashboardStats.activeContracts}</span>
                            <span className="text-muted-foreground">Completed: {contracts.filter(c => c.status === 'completed').length}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats and Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                      {/* Status Breakdown */}
                      <div className="lg:col-span-2 bg-white border border-border rounded-lg p-2.5 sm:p-3 md:p-4 lg:p-5 shadow-sm">
                        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 flex items-center gap-1.25 sm:gap-1.5 md:gap-2">
                          <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                          Status Overview
                        </h2>
                        <div className="space-y-1.5 sm:space-y-2 md:space-y-3 lg:space-y-4">
                          {/* Designer Status */}
                          <div>
                            <div className="flex justify-between items-center mb-1 md:mb-2">
                              <span className="text-xs md:text-sm font-medium">Designers</span>
                              <span className="text-[10px] md:text-xs text-muted-foreground">{designers.length} total</span>
                            </div>
                            <div className="flex gap-1.25 sm:gap-1.5 md:gap-2">
                              <div className="flex-1 bg-green-50 rounded p-1.25 sm:p-1.5 md:p-2 text-center">
                                <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-green-700">{designers.filter(d => d.status === 'approved').length}</div>
                                <div className="text-[9px] sm:text-[10px] md:text-xs text-green-600">Approved</div>
                              </div>
                              <div className="flex-1 bg-orange-50 rounded p-1.25 sm:p-1.5 md:p-2 text-center">
                                <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-orange-700">{designers.filter(d => d.status === 'pending').length}</div>
                                <div className="text-[9px] sm:text-[10px] md:text-xs text-orange-600">Pending</div>
                              </div>
                              <div className="flex-1 bg-red-50 rounded p-1.25 sm:p-1.5 md:p-2 text-center">
                                <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-red-700">{designers.filter(d => d.status === 'rejected').length}</div>
                                <div className="text-[9px] sm:text-[10px] md:text-xs text-red-600">Rejected</div>
                              </div>
                            </div>
                          </div>

                          {/* Contract Status */}
                          <div>
                            <div className="flex justify-between items-center mb-1 md:mb-2">
                              <span className="text-xs md:text-sm font-medium">Contracts</span>
                              <span className="text-[10px] md:text-xs text-muted-foreground">{contracts.length} total</span>
                            </div>
                            <div className="flex gap-1.5 md:gap-2">
                              <div className="flex-1 bg-blue-50 rounded p-1.5 md:p-2 text-center">
                                <div className="text-sm md:text-lg font-bold text-blue-700">{contracts.filter(c => c.status === 'pending').length}</div>
                                <div className="text-[10px] md:text-xs text-blue-600">Pending</div>
                              </div>
                              <div className="flex-1 bg-green-50 rounded p-1.5 md:p-2 text-center">
                                <div className="text-sm md:text-lg font-bold text-green-700">{contracts.filter(c => c.status === 'awarded').length}</div>
                                <div className="text-[10px] md:text-xs text-green-600">Awarded</div>
                              </div>
                              <div className="flex-1 bg-gray-50 rounded p-1.5 md:p-2 text-center">
                                <div className="text-sm md:text-lg font-bold text-gray-700">{contracts.filter(c => c.status === 'completed').length}</div>
                                <div className="text-[10px] md:text-xs text-gray-600">Completed</div>
                              </div>
                            </div>
                          </div>

                          {/* Designs Status */}
                          <div>
                            <div className="flex justify-between items-center mb-1 md:mb-2">
                              <span className="text-xs md:text-sm font-medium">Designs</span>
                              <span className="text-[10px] md:text-xs text-muted-foreground">{designsForReview.length} total</span>
                            </div>
                            <div className="flex gap-1.5 md:gap-2">
                              <div className="flex-1 bg-blue-50 rounded p-1.5 md:p-2 text-center">
                                <div className="text-sm md:text-lg font-bold text-blue-700">{designsForReview.filter(d => d.status === 'submitted').length}</div>
                                <div className="text-[10px] md:text-xs text-blue-600">Submitted</div>
                              </div>
                              <div className="flex-1 bg-green-50 rounded p-1.5 md:p-2 text-center">
                                <div className="text-sm md:text-lg font-bold text-green-700">{designsForReview.filter(d => d.status === 'approved').length}</div>
                                <div className="text-[10px] md:text-xs text-green-600">Approved</div>
                              </div>
                              <div className="flex-1 bg-red-50 rounded p-1.5 md:p-2 text-center">
                                <div className="text-sm md:text-lg font-bold text-red-700">{designsForReview.filter(d => d.status === 'rejected').length}</div>
                                <div className="text-[10px] md:text-xs text-red-600">Rejected</div>
                              </div>
                            </div>
                          </div>

                          {/* User Roles */}
                          <div>
                            <div className="flex justify-between items-center mb-1 md:mb-2">
                              <span className="text-xs md:text-sm font-medium">User Roles</span>
                              <span className="text-[10px] md:text-xs text-muted-foreground">{users.length} total</span>
                            </div>
                            <div className="flex gap-1.5 md:gap-2">
                              <div className="flex-1 bg-blue-50 rounded p-1.5 md:p-2 text-center">
                                <div className="text-sm md:text-lg font-bold text-blue-700">{users.filter(u => u.role === 'member').length}</div>
                                <div className="text-[10px] md:text-xs text-blue-600">Members</div>
                              </div>
                              <div className="flex-1 bg-purple-50 rounded p-1.5 md:p-2 text-center">
                                <div className="text-sm md:text-lg font-bold text-purple-700">{users.filter(u => u.role === 'designer').length}</div>
                                <div className="text-[10px] md:text-xs text-purple-600">Designers</div>
                              </div>
                              <div className="flex-1 bg-orange-50 rounded p-1.5 md:p-2 text-center">
                                <div className="text-sm md:text-lg font-bold text-orange-700">{users.filter(u => u.role === 'admin').length}</div>
                                <div className="text-[10px] md:text-xs text-orange-600">Admins</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="bg-white border border-border rounded-lg p-2.5 sm:p-3 md:p-4 lg:p-5 shadow-sm">
                        <h2 className="text-base md:text-xl font-semibold mb-2 md:mb-4 flex items-center gap-1.5 md:gap-2">
                          <Clock className="w-3.5 h-3.5 md:w-5 md:h-5" />
                          Recent Activity
                        </h2>
                        <div className="space-y-2 md:space-y-3 max-h-64 md:max-h-96 overflow-y-auto">
                          {dashboardStats.recentActivity.length > 0 ? (
                            dashboardStats.recentActivity.map((log) => (
                              <div key={log.id} className="border-l-2 border-primary pl-2 md:pl-3 py-1.5 md:py-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs md:text-sm font-medium truncate">{log.action}</p>
                                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 truncate">
                                      {log.performedByName || log.performedByEmail || 'System'}
                                    </p>
                                    {log.details && (
                                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 line-clamp-1">{log.details}</p>
                                    )}
                                  </div>
                                  <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap ml-1 md:ml-2 flex-shrink-0">
                                    {new Date(log.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 md:py-8 text-muted-foreground">
                              <Activity className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 opacity-50" />
                              <p className="text-xs md:text-sm">No recent activity</p>
                            </div>
                          )}
                        </div>
                        {dashboardStats.recentActivity.length > 0 && (
                          <button
                            onClick={() => setActiveTab("audit")}
                            className="mt-2 md:mt-4 w-full text-xs md:text-sm text-primary hover:underline"
                          >
                            View all audit logs →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white border border-border rounded-lg p-3 md:p-6 shadow-sm">
                      <h2 className="text-base md:text-xl font-semibold mb-2 md:mb-4">Quick Actions</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                        <button
                          onClick={() => setActiveTab("users")}
                          className="p-2.5 md:p-4 border border-border rounded-lg hover:bg-primary/5 hover:border-primary transition-colors text-left"
                        >
                          <UserCog className="w-3.5 h-3.5 md:w-5 md:h-5 mb-1 md:mb-2 text-primary" />
                          <div className="font-medium text-xs md:text-sm">Manage Users</div>
                          <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">{users.length} users</div>
                        </button>
                        <button
                          onClick={() => setActiveTab("designers")}
                          className="p-2.5 md:p-4 border border-border rounded-lg hover:bg-primary/5 hover:border-primary transition-colors text-left"
                        >
                          <Users className="w-3.5 h-3.5 md:w-5 md:h-5 mb-1 md:mb-2 text-primary" />
                          <div className="font-medium text-xs md:text-sm">Manage Designers</div>
                          <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">{designers.length} designers</div>
                        </button>
                        <button
                          onClick={() => setActiveTab("products")}
                          className="p-2.5 md:p-4 border border-border rounded-lg hover:bg-primary/5 hover:border-primary transition-colors text-left"
                        >
                          <Package className="w-3.5 h-3.5 md:w-5 md:h-5 mb-1 md:mb-2 text-primary" />
                          <div className="font-medium text-xs md:text-sm">Manage Products</div>
                          <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">{products.length} products</div>
                        </button>
                        <button
                          onClick={() => setActiveTab("contracts")}
                          className="p-2.5 md:p-4 border border-border rounded-lg hover:bg-primary/5 hover:border-primary transition-colors text-left"
                        >
                          <FileText className="w-3.5 h-3.5 md:w-5 md:h-5 mb-1 md:mb-2 text-primary" />
                          <div className="font-medium text-xs md:text-sm">View Contracts</div>
                          <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">{contracts.length} contracts</div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                {/* Header with Create Button */}
                <div className="mb-3 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-1 w-full">
                    <div className="flex-1 relative">
                      <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 md:w-5 md:h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full pl-7 md:pl-10 pr-2 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-1.5 md:gap-2">
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                      >
                        <option value="all">All Roles</option>
                        <option value="member">Member ({users.filter(u => u.role === 'member').length})</option>
                        <option value="designer">Designer ({users.filter(u => u.role === 'designer').length})</option>
                        <option value="admin">Admin ({users.filter(u => u.role === 'admin').length})</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs md:text-sm font-medium w-full md:w-auto"
                  >
                    + Create User
                  </button>
                </div>

                {/* Users List */}
                {loading ? (
                  <SkeletonTable />
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14 bg-white border border-border rounded-lg">
                    <UserCog className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-muted-foreground" />
                    <p className="text-xs md:text-body text-muted-foreground">
                      {userSearchQuery || roleFilter !== "all"
                        ? "No users match your filters."
                        : "No users found."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-4">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="bg-white border border-border rounded-lg p-2.5 sm:p-3 md:p-4 lg:p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-2 md:gap-4 mb-2 md:mb-3">
                              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <UserCog className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 md:gap-3 mb-1">
                                  <h3 className="text-sm md:text-xl font-medium truncate">{user.name}</h3>
                                  <span
                                    className={`text-[10px] md:text-xs px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full font-medium ${
                                      user.role === "admin"
                                        ? "bg-purple-100 text-purple-700"
                                        : user.role === "designer"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {user.role.toUpperCase()}
                                  </span>
                                  {user.emailVerified && (
                                    <span className="text-[10px] md:text-xs px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full font-medium bg-green-100 text-green-700">
                                      VERIFIED
                                    </span>
                                  )}
                                  {!user.emailVerified && (
                                    <span className="text-[10px] md:text-xs px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">
                                      UNVERIFIED
                                    </span>
                                  )}
                                  {user.membership && (
                                    <span
                                      className={`text-[10px] md:text-xs px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full font-medium ${
                                        user.membership.tier === "premier"
                                          ? "bg-purple-100 text-purple-700"
                                          : user.membership.tier === "plus"
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {user.membership.tier.toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">
                                  <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                  <a
                                    href={`mailto:${user.email}`}
                                    className="hover:text-primary transition-colors truncate"
                                  >
                                    {user.email}
                                  </a>
                                </div>
                                <div className="flex flex-col gap-0.5 md:gap-1 mt-1 md:mt-2 text-[10px] md:text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5 md:gap-2">
                                    <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                                    <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  {user.membership && (
                                    <div className="flex flex-col gap-1 md:gap-2 mt-1 md:mt-2">
                                      <div className="flex items-center gap-1.5 md:gap-2">
                                        <span className="font-medium">Tier:</span>
                                        <span>{user.membership.tier.toUpperCase()}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 md:gap-2">
                                        <span className="font-medium">Points:</span>
                                        {editingPointsUserId === user.id ? (
                                          <div className="flex items-center gap-1.5 md:gap-2">
                                            <input
                                              type="number"
                                              min="0"
                                              defaultValue={user.membership.points}
                                              onBlur={(e) => {
                                                const newPoints = parseInt(e.target.value);
                                                if (!isNaN(newPoints) && newPoints >= 0) {
                                                  updatePointsAndSpending(user.id, newPoints);
                                                } else {
                                                  setEditingPointsUserId(null);
                                                }
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  const newPoints = parseInt((e.target as HTMLInputElement).value);
                                                  if (!isNaN(newPoints) && newPoints >= 0) {
                                                    updatePointsAndSpending(user.id, newPoints);
                                                  } else {
                                                    setEditingPointsUserId(null);
                                                  }
                                                } else if (e.key === 'Escape') {
                                                  setEditingPointsUserId(null);
                                                }
                                              }}
                                              className="w-16 md:w-24 px-1.5 md:px-2 py-0.5 md:py-1 border border-border rounded text-xs md:text-sm"
                                              autoFocus
                                            />
                                            <button
                                              onClick={() => setEditingPointsUserId(null)}
                                              className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <span 
                                            className="cursor-pointer hover:text-primary underline text-[10px] md:text-xs"
                                            onClick={() => setEditingPointsUserId(user.id)}
                                          >
                                            {user.membership.points}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">Spending:</span>
                                        {editingSpendingUserId === user.id ? (
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm">$</span>
                                            <input
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              defaultValue={user.membership.annualSpending}
                                              onBlur={(e) => {
                                                const newSpending = parseFloat(e.target.value);
                                                if (!isNaN(newSpending) && newSpending >= 0) {
                                                  updatePointsAndSpending(user.id, undefined, newSpending.toString());
                                                } else {
                                                  setEditingSpendingUserId(null);
                                                }
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  const newSpending = parseFloat((e.target as HTMLInputElement).value);
                                                  if (!isNaN(newSpending) && newSpending >= 0) {
                                                    updatePointsAndSpending(user.id, undefined, newSpending.toString());
                                                  } else {
                                                    setEditingSpendingUserId(null);
                                                  }
                                                } else if (e.key === 'Escape') {
                                                  setEditingSpendingUserId(null);
                                                }
                                              }}
                                              className="w-24 px-2 py-1 border border-border rounded text-sm"
                                              autoFocus
                                            />
                                            <button
                                              onClick={() => setEditingSpendingUserId(null)}
                                              className="text-xs text-muted-foreground hover:text-foreground"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <span 
                                            className="cursor-pointer hover:text-primary underline"
                                            onClick={() => setEditingSpendingUserId(user.id)}
                                          >
                                            ${user.membership.annualSpending}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 md:min-w-[200px]">
                            <div className="relative">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                disabled={changingRoleUserId === user.id || user.id === session?.user?.id}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="member">Member</option>
                                <option value="designer">Designer</option>
                                <option value="admin">Admin</option>
                              </select>
                              {changingRoleUserId === user.id && (
                                <Loader2 className="absolute right-3 top-8 transform -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                              )}
                            </div>
                            {user.role === "member" && (
                              <button
                                onClick={() => updateUserRole(user.id, "designer")}
                                disabled={changingRoleUserId === user.id || user.id === session?.user?.id}
                                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Upgrade to Designer
                              </button>
                            )}
                            <div className="relative">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Membership Tier</label>
                              <select
                                value={user.membership?.tier || "member"}
                                onChange={(e) => updateMembershipTier(user.id, e.target.value)}
                                disabled={changingMembershipUserId === user.id}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="member">Member</option>
                                <option value="plus">Plus</option>
                                <option value="premier">Premier</option>
                              </select>
                              {changingMembershipUserId === user.id && (
                                <Loader2 className="absolute right-3 top-8 transform -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                              )}
                            </div>
                            {!user.emailVerified && (
                              <button
                                onClick={() => verifyUser(user.id)}
                                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors rounded-lg text-sm font-medium"
                              >
                                Verify Email
                              </button>
                            )}
                            {user.membership && (
                              <button
                                onClick={() => {
                                  setTransactionsUploadUserId(user.id);
                                  setShowTransactionsUploadModal(true);
                                }}
                                className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors rounded-lg text-sm font-medium"
                              >
                                Upload Transactions CSV
                              </button>
                            )}
                            {user.id === session?.user?.id && (
                              <p className="text-xs text-muted-foreground text-center">(Your account)</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === "audit" && (
              <div>
                {loading ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14">
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin mx-auto mb-2 md:mb-4 text-primary" />
                    <p className="text-xs md:text-body text-muted-foreground">Loading audit logs...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14 bg-white border border-border rounded-lg">
                    <FileTextIcon className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-muted-foreground" />
                    <p className="text-xs md:text-body text-muted-foreground">No audit logs found.</p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-4">
                    {auditLogs.map((log) => {
                      let details = null;
                      try {
                        details = log.details ? JSON.parse(log.details) : null;
                      } catch (e) {
                        // Invalid JSON, ignore
                      }

                      return (
                        <div
                          key={log.id}
                          className="bg-white border border-border rounded-lg p-2.5 sm:p-3 md:p-4 lg:p-5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2 md:mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 md:gap-3 mb-1 md:mb-2">
                                <span className="text-xs md:text-sm font-medium text-primary">
                                  {log.action.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className="text-[10px] md:text-xs text-muted-foreground">
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-xs md:text-sm text-muted-foreground">
                                <p className="truncate">
                                  <strong>Performed by:</strong> {log.performedByName || log.performedByEmail || log.performedBy}
                                </p>
                                {log.targetUserId && (
                                  <p className="mt-0.5 md:mt-1 truncate">
                                    <strong>Target user:</strong> {details?.targetUserName || details?.targetUserEmail || log.targetUserId}
                                  </p>
                                )}
                                {details && (
                                  <div className="mt-1 md:mt-2 p-2 md:p-3 bg-secondary rounded-lg space-y-0.5 md:space-y-1">
                                    {details.oldRole && details.newRole && (
                                      <p className="text-xs md:text-sm">
                                        <strong>Role change:</strong> {details.oldRole} → {details.newRole}
                                      </p>
                                    )}
                                    {details.oldTier && details.newTier && (
                                      <p className="text-xs md:text-sm">
                                        <strong>Membership tier change:</strong> {details.oldTier} → {details.newTier}
                                      </p>
                                    )}
                                    {details.oldPoints !== undefined && details.newPoints !== undefined && (
                                      <p className="text-xs md:text-sm">
                                        <strong>Points change:</strong> {details.oldPoints} → {details.newPoints}
                                      </p>
                                    )}
                                    {details.oldSpending && details.newSpending && (
                                      <p className="text-xs md:text-sm">
                                        <strong>Spending change:</strong> ${details.oldSpending} → ${details.newSpending}
                                      </p>
                                    )}
                                    {details.transactionsCount && (
                                      <div className="text-sm space-y-1">
                                        <p>
                                          <strong>Bulk transactions upload:</strong> {details.transactionsCount} transactions
                                        </p>
                                        {details.pointsAdded !== undefined && (
                                          <p>
                                            <strong>Points added:</strong> {details.pointsAdded > 0 ? '+' : ''}{details.pointsAdded}
                                          </p>
                                        )}
                                        {details.spendingAdded !== undefined && (
                                          <p>
                                            <strong>Spending change:</strong> {details.spendingAdded > 0 ? '+' : ''}${details.spendingAdded}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {log.ipAddress && (
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    IP: {log.ipAddress}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Portfolios Tab */}
            {activeTab === "portfolios" && (
              <div>
                {/* Header with Search and Filters */}
                <div className="mb-3 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-1">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search portfolios by name, email, or specialties..."
                        value={portfolioSearchQuery}
                        onChange={(e) => setPortfolioSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={portfolioStatusFilter}
                        onChange={(e) => setPortfolioStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                      >
                        <option value="all">All Portfolios</option>
                        <option value="approved">Approved Only</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Portfolios List */}
                {loading ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14">
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin mx-auto mb-2 md:mb-4 text-primary" />
                    <p className="text-xs md:text-body text-muted-foreground">Loading portfolios...</p>
                  </div>
                ) : (() => {
                  // Filter portfolios
                  let filtered = designers;
                  
                  // Filter by status (only show approved by default, or based on filter)
                  if (portfolioStatusFilter === "approved") {
                    filtered = filtered.filter((d) => d.status === "approved");
                  } else if (portfolioStatusFilter === "pending") {
                    filtered = filtered.filter((d) => d.status === "pending");
                  } else if (portfolioStatusFilter === "rejected") {
                    filtered = filtered.filter((d) => d.status === "rejected");
                  }
                  
                  // Filter by search query
                  if (portfolioSearchQuery) {
                    const query = portfolioSearchQuery.toLowerCase();
                    filtered = filtered.filter(
                      (d) =>
                        d.name.toLowerCase().includes(query) ||
                        d.email.toLowerCase().includes(query) ||
                        (d.specialties && d.specialties.toLowerCase().includes(query)) ||
                        (d.bio && d.bio.toLowerCase().includes(query))
                    );
                  }
                  
                  return filtered.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14 bg-white border border-border rounded-lg">
                      <Briefcase className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-muted-foreground" />
                      <p className="text-xs md:text-body text-muted-foreground">
                        {portfolioSearchQuery || portfolioStatusFilter !== "all"
                          ? "No portfolios match your filters."
                          : "No portfolios found."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
                      {filtered.map((designer) => (
                        <div
                          key={designer.id}
                          className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          {/* Banner Image */}
                          {designer.bannerUrl ? (
                            <div className="relative w-full h-32 bg-secondary">
                              <img
                                src={designer.bannerUrl}
                                alt={`${designer.name} banner`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  if (target.parentElement) {
                                    target.parentElement.innerHTML = '<div class="w-full h-32 bg-gradient-to-br from-secondary to-accent-background"></div>';
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-secondary to-accent-background" />
                          )}

                          <div className="p-2.5 sm:p-3 md:p-4 lg:p-5">
                            <div className="flex items-start gap-2 md:gap-4 mb-2 md:mb-4 -mt-6 md:-mt-12">
                              {/* Avatar */}
                              {designer.avatarUrl ? (
                                <img
                                  src={designer.avatarUrl}
                                  alt={designer.name}
                                  className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 md:border-4 border-white object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    if (target.parentElement) {
                                      target.parentElement.innerHTML = '<div class="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 md:border-4 border-white bg-primary/10 flex items-center justify-center"><svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 md:border-4 border-white bg-primary/10 flex items-center justify-center">
                                  <Users className="w-8 h-8 text-primary" />
                                </div>
                              )}
                              <div className="flex-1 pt-12">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-sm md:text-lg font-medium">{designer.name}</h3>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      designer.status === "approved"
                                        ? "bg-green-100 text-green-700"
                                        : designer.status === "rejected"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {designer.status.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate">{designer.email}</span>
                                </div>
                              </div>
                            </div>

                            {designer.specialties && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Specialties:</strong> {designer.specialties}
                              </p>
                            )}

                            {designer.bio && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {designer.bio}
                              </p>
                            )}

                            <div className="flex flex-col gap-2 pt-4 border-t border-border">
                              <a
                                href={`/designers/${designer.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg text-xs md:text-sm font-medium"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Portfolio
                              </a>
                              <button
                                onClick={() => {
                                  router.push(`/designers/${designer.id}`);
                                }}
                                className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 border border-border text-foreground hover:bg-secondary transition-colors rounded-lg text-xs md:text-sm font-medium"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Portfolio
                              </button>
                              {designer.portfolioUrl && (
                                <a
                                  href={designer.portfolioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-primary/10 transition-colors rounded-lg text-sm font-medium"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  External Portfolio
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Designers Tab */}
            {activeTab === "designers" && (
              <div>
                {/* Header with Create Button */}
                <div className="mb-3 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-1">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search designers by name, email, or specialties..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                      >
                        <option value="all">All Status ({designers.length})</option>
                        <option value="pending">Pending ({designers.filter((d) => d.status === "pending").length})</option>
                        <option value="approved">Approved ({designers.filter((d) => d.status === "approved").length})</option>
                        <option value="rejected">Rejected ({designers.filter((d) => d.status === "rejected").length})</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateDesignerModal(true);
                      setUploadedAvatarUrl(null);
                      setAvatarPreview(null);
                      setAvatarFile(null);
                    }}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs md:text-sm font-medium"
                  >
                    + Create Designer
                  </button>
                </div>

                {/* Designers List */}
                {loading ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14">
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin mx-auto mb-2 md:mb-4 text-primary" />
                    <p className="text-xs md:text-body text-muted-foreground">Loading designers...</p>
                  </div>
                ) : filteredDesigners.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14 bg-white border border-border rounded-lg">
                    <Users className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-muted-foreground" />
                    <p className="text-xs md:text-body text-muted-foreground">
                      {searchQuery || statusFilter !== "all"
                        ? "No designers match your filters."
                        : "No designers found."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-4">
                    {filteredDesigners.map((designer) => (
                      <div
                        key={designer.id}
                        className="bg-white border border-border rounded-lg p-2.5 sm:p-3 md:p-4 lg:p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-2 md:gap-4 mb-2 md:mb-3">
                              {designer.avatarUrl ? (
                                <img
                                  src={designer.avatarUrl}
                                  alt={designer.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    if (target.parentElement) {
                                      target.parentElement.innerHTML = '<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="w-6 h-6 text-primary" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="text-xl font-medium">{designer.name}</h3>
                                  <span
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                      designer.status === "approved"
                                        ? "bg-green-100 text-green-700"
                                        : designer.status === "rejected"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {designer.status.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <Mail className="w-4 h-4" />
                                  <a
                                    href={`mailto:${designer.email}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {designer.email}
                                  </a>
                                </div>
                                {designer.specialties && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    <strong>Specialties:</strong> {designer.specialties}
                                  </p>
                                )}
                                {designer.bio && (
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {designer.bio}
                                  </p>
                                )}
                                {designer.portfolioUrl && (
                                  <a
                                    href={designer.portfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                  >
                                    View Portfolio <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>Applied: {new Date(designer.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 md:min-w-[200px]">
                            {designer.status !== "approved" && (
                              <button
                                onClick={() => updateDesignerStatus(designer.id, "approved")}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors rounded-lg text-sm font-medium"
                              >
                                <Check className="w-4 h-4" />
                                Approve
                              </button>
                            )}
                            {designer.status !== "rejected" && (
                              <button
                                onClick={() => updateDesignerStatus(designer.id, "rejected")}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded-lg text-sm font-medium"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingDesigner(designer);
                                setShowEditDesignerModal(true);
                                setUploadedAvatarUrl(null);
                                setAvatarPreview(null);
                                setAvatarFile(null);
                                setUploadedBannerUrl(null);
                                setBannerPreview(null);
                                setBannerFile(null);
                              }}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-border text-foreground hover:bg-secondary transition-colors rounded-lg text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setUploadingDocumentForDesigner(designer.id);
                                setAdminDocumentForm({
                                  title: '',
                                  description: '',
                                  category: '',
                                  fileUrl: '',
                                  fileName: '',
                                  fileSize: 0,
                                  fileType: '',
                                  file: null,
                                });
                                setShowUploadDocumentModal(true);
                              }}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-primary/10 transition-colors rounded-lg text-sm font-medium"
                            >
                              <Upload className="w-4 h-4" />
                              Upload Document
                            </button>
                            <button
                              onClick={() => deleteDesigner(designer.id)}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 transition-colors rounded-lg text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div>
                {/* Toggle between List View and CSV Upload */}
                <div className="mb-6 flex flex-col gap-4">
                  <div className="flex gap-2 border-b border-border">
                    <button
                      onClick={() => setShowProductListView(true)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        showProductListView
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Product List
                    </button>
                    <button
                      onClick={() => setShowProductListView(false)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        !showProductListView
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Bulk Upload (CSV)
                    </button>
                  </div>
                </div>

                {/* CSV Upload Section */}
                {!showProductListView && (
                  <div className="max-w-3xl mx-auto">
                    <div className="bg-white border border-border rounded-lg p-4 md:p-8">
                      <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full mb-2 md:mb-4">
                          <Upload className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </div>
                        <h2 className="text-lg md:text-2xl font-medium mb-1 md:mb-2">Bulk Product Upload</h2>
                        <p className="text-xs md:text-body text-muted-foreground">
                          Upload a CSV file to add multiple products at once
                        </p>
                      </div>

                      <div className="mb-6 sm:mb-8 md:mb-10 p-4 sm:p-5 md:p-6 bg-secondary rounded-lg">
                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          CSV Format Requirements
                        </h3>
                        <div className="text-sm text-muted-foreground space-y-4">
                          <div>
                            <p className="font-medium text-foreground mb-2">Supported Formats:</p>
                            
                            {/* Blm-product-search Format */}
                            <div className="pl-3 border-l-2 border-primary mb-4">
                              <p className="font-medium text-foreground mb-1">Blm-product-search Format</p>
                              <p className="text-xs mb-2">This format supports 9-10 columns. All columns are used for product data.</p>
                              <ul className="list-disc list-inside mt-1 ml-2 space-y-1 text-xs">
                                <li><strong>Column 0:</strong> Blm-product-search-image-container__image Image (first image URL) - Optional</li>
                                <li><strong>Column 1:</strong> Blm-product-search-image-container__image (2) Image (second image URL) - Optional</li>
                                <li><strong>Column 2:</strong> Blm-product-search-container URL (product URL) - Optional</li>
                                <li><strong>Column 3:</strong> Blm-product-search-image-container__image Description (SKU/slug) - Optional</li>
                                <li><strong>Column 4:</strong> Title (product name) - <strong>Required</strong></li>
                                <li><strong>Column 5:</strong> Span (badge text like "New", "Selling Fast", "29% Off") - Optional</li>
                                <li><strong>Column 6:</strong> Blm-product-search-badge (usually empty) - Optional</li>
                                <li><strong>Column 7:</strong> Blm-product-search-sustainability (sustainability tags) - Optional</li>
                                <li><strong>Column 8:</strong> Price (current price with $) - <strong>Required</strong></li>
                                <li><strong>Column 9:</strong> Original price when on sale (optional) - Optional</li>
                              </ul>
                              <p className="text-xs mt-2 text-muted-foreground">
                                <strong>Note:</strong> SKU is extracted from Column 3 (Description/Slug). If not available, it's extracted from the product URL.
                                Description is built from badge and sustainability tags.
                              </p>
                            </div>

                            {/* Fashion CSV Format */}
                            <div className="pl-3 border-l-2 border-primary">
                              <p className="font-medium text-foreground mb-1">Fashion CSV Format (fashion.csv)</p>
                              <p className="text-xs mb-2">This format supports up to 20 columns. The first 6 columns are used for product data.</p>
                              <ul className="list-disc list-inside mt-1 ml-2 space-y-1 text-xs">
                                <li><strong>Column 0:</strong> Tile-image Image (product image URL) - Optional</li>
                                <li><strong>Column 1:</strong> Product-tile__anchor URL (product URL) - Optional</li>
                                <li><strong>Column 2:</strong> Product-tile__body-section (product name) - <strong>Required</strong></li>
                                <li><strong>Column 3:</strong> Price (with $ symbol) - Optional</li>
                                <li><strong>Column 4:</strong> Price (numeric only) - <strong>Required</strong></li>
                                <li><strong>Column 5:</strong> Tile-image Description (product description) - Optional</li>
                                <li><strong>Columns 6-19:</strong> Additional swatch/color data (optional, not used for product creation)</li>
                              </ul>
                              <p className="text-xs mt-2 text-muted-foreground">
                                <strong>Note:</strong> SKU is automatically extracted from the product URL (Column 1) if available.
                                If the URL contains a pattern like <code className="bg-white px-1 rounded">/1316169WYM.html</code>, the SKU will be extracted as <code className="bg-white px-1 rounded">1316169WYM</code>.
                              </p>
                            </div>
                          </div>
                          <div className="p-4 bg-white border border-border rounded text-xs font-mono overflow-x-auto mt-4">
                            <div className="text-muted-foreground mb-2">Blm-product-search CSV Header Format:</div>
                            <div className="text-[10px] leading-relaxed break-all">
                              Blm-product-search-image-container__image Image,Blm-product-search-image-container__image (2) Image,Blm-product-search-container URL,Blm-product-search-image-container__image Description,Title,Span,Blm-product-search-badge,Blm-product-search-sustainability,Price
                            </div>
                            <div className="text-muted-foreground mb-2 mt-3">Example Blm-product-search CSV Row:</div>
                            <div className="text-[10px] leading-relaxed break-all">
                              "https://cdn.shopify.com/.../image1.jpg","https://cdn.shopify.com/.../image2.jpg","https://www.everlane.com/products/mens-cashmere-crew-heathered-mahogany","mens-cashmere-crew-heathered-mahogany","The Cashmere Crew","New","","Cleaner Chemistry, Renewed Materials","$199.28"
                            </div>
                            <div className="text-muted-foreground mb-2 mt-4">Fashion CSV Header Format:</div>
                            <div className="text-[10px] leading-relaxed break-all">
                              Tile-image Image,Product-tile__anchor URL,Product-tile__body-section,Price,Price,Tile-image Description,...
                            </div>
                            <div className="text-muted-foreground mb-2 mt-3">Example Fashion CSV Row:</div>
                            <div className="text-[10px] leading-relaxed break-all">
                              "https://media.example.com/image/w_600/product.json","https://www.example.com/products/product-name/1316169WYM.html","Product Name","$328.00","328","Product Description",...
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label
                          htmlFor="csv-upload"
                          className="block w-full px-6 sm:px-8 md:px-10 py-9 sm:py-10 md:py-12 border-2 border-dashed border-border hover:border-primary transition-colors rounded-lg cursor-pointer text-center bg-secondary/50 hover:bg-secondary"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
                              <span className="text-button-primary">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                              <span className="text-button-primary block mb-2">Click to upload CSV file</span>
                              <span className="text-xs text-muted-foreground">or drag and drop</span>
                            </>
                          )}
                        </label>
                        <input
                          type="file"
                          id="csv-upload"
                          accept=".csv"
                          onChange={handleCSVUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </div>

                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={downloadCSVTemplate}
                          className="px-4 py-2 border border-border text-foreground hover:bg-secondary transition-colors rounded-lg text-sm font-medium"
                        >
                          Download CSV Template
                        </button>
                      </div>

                      {uploadResult && (
                        <div
                          className={`mt-6 p-4 rounded-lg ${
                            uploadResult.includes("Successfully")
                              ? "bg-green-50 border border-green-200 text-green-800"
                              : "bg-red-50 border border-red-200 text-red-800"
                          }`}
                        >
                          {uploadResult}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Product List View */}
                {showProductListView && (
                  <div>
                    {/* Header with Bulk Actions */}
                    <div className="mb-3 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search products by name, description, category, or SKU..."
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div className="flex gap-2">
                        {selectedProducts.length > 0 && (
                          <button
                            onClick={bulkDeleteProducts}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Delete Selected ({selectedProducts.length})
                          </button>
                        )}
                      </div>
                    </div>

                {/* Products List */}
                {loading ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14">
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin mx-auto mb-2 md:mb-4 text-primary" />
                    <p className="text-xs md:text-body text-muted-foreground">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14 bg-white border border-border rounded-lg">
                    <Package className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-muted-foreground" />
                    <p className="text-xs md:text-body text-muted-foreground">
                      {productSearchQuery ? "No products match your search." : "No products found."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white border border-border rounded-lg p-2.5 sm:p-3 md:p-4 lg:p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                          <div className="flex-1 flex gap-2 md:gap-4">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 object-cover rounded-lg flex-shrink-0"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 md:gap-3 mb-1 md:mb-2">
                                <h3 className="text-sm md:text-xl font-medium truncate">{product.name}</h3>
                                {product.sku && (
                                  <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-secondary rounded text-muted-foreground">
                                    SKU: {product.sku}
                                  </span>
                                )}
                              </div>
                              {product.description && (
                                <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2 line-clamp-2">
                                  {product.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
                                <span className="font-medium">${product.price}</span>
                                {product.category && (
                                  <span className="text-muted-foreground">Category: {product.category}</span>
                                )}
                                <span className="text-muted-foreground">Stock: {product.stock || 0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 md:min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProducts([...selectedProducts, product.id]);
                                  } else {
                                    setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-muted-foreground">Select</span>
                            </div>
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setShowEditProductModal(true);
                              }}
                              className="px-4 py-2 border border-border text-foreground hover:bg-secondary transition-colors rounded-lg text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded-lg text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                  </div>
                )}
              </div>
            )}

            {/* Contracts Tab */}
            {activeTab === "contracts" && (
              <div>
                {/* Header with Create Button */}
                <div className="mb-3 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-1">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search contracts by title, description, or designer..."
                        value={contractSearchQuery}
                        onChange={(e) => setContractSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={contractStatusFilter}
                        onChange={(e) => setContractStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="awarded">Awarded</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateContractModal(true)}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs md:text-sm font-medium"
                  >
                    + Create Contract
                  </button>
                </div>

                {/* Contracts List */}
                {loading ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14">
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin mx-auto mb-2 md:mb-4 text-primary" />
                    <p className="text-xs md:text-body text-muted-foreground">Loading contracts...</p>
                  </div>
                ) : filteredContracts.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14 bg-white border border-border rounded-lg">
                    <FileText className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-muted-foreground" />
                    <p className="text-xs md:text-body text-muted-foreground">
                      {contractSearchQuery || contractStatusFilter !== "all"
                        ? "No contracts match your filters."
                        : "No contracts found."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-4">
                    {filteredContracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="bg-white border border-border rounded-lg p-4 sm:p-5 md:p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={(e) => {
                          // Don't trigger if clicking on buttons
                          if ((e.target as HTMLElement).closest('button')) {
                            return;
                          }
                          setViewingContract(contract);
                          setShowContractDetailsModal(true);
                          if (contract.designerId) {
                            fetchContractDocuments(contract.designerId, contract.id);
                          }
                        }}
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-medium">{contract.title}</h3>
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
                            {contract.designer && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Designer:</strong> {contract.designer.name} ({contract.designer.email})
                              </p>
                            )}
                            {contract.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {contract.description}
                              </p>
                            )}
                            {contract.amount && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Amount:</strong> ${contract.amount}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                <span>Created: {new Date(contract.createdAt).toLocaleDateString()}</span>
                              </div>
                              {contract.contractFileUrl && (
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span className="font-medium">Document Uploaded</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 md:min-w-[150px]">
                            {contract.contractFileUrl && (
                              <a
                                href={contract.contractFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="px-4 py-2 border border-border text-foreground hover:bg-secondary transition-colors rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Document
                              </a>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingContract(contract);
                                setShowEditContractModal(true);
                              }}
                              className="px-4 py-2 border border-border text-foreground hover:bg-secondary transition-colors rounded-lg text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteContract(contract.id);
                              }}
                              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded-lg text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Designs Tab */}
            {activeTab === "designs" && (
              <div>
                {/* Header with Search and Filters */}
                <div className="mb-3 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-1">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search designs by title, description, category, or designer..."
                        value={designSearchQuery}
                        onChange={(e) => setDesignSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={designStatusFilter}
                        onChange={(e) => setDesignStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                      >
                        <option value="all">All Status ({designsForReview.length})</option>
                        <option value="submitted">Submitted ({designsForReview.filter((d) => d.status === "submitted").length})</option>
                        <option value="approved">Approved ({designsForReview.filter((d) => d.status === "approved").length})</option>
                        <option value="rejected">Rejected ({designsForReview.filter((d) => d.status === "rejected").length})</option>
                        <option value="draft">Draft ({designsForReview.filter((d) => d.status === "draft").length})</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Designs List */}
                {loading ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14">
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin mx-auto mb-2 md:mb-4 text-primary" />
                    <p className="text-xs md:text-body text-muted-foreground">Loading designs...</p>
                  </div>
                ) : filteredDesignsForReview.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14 bg-white border border-border rounded-lg">
                    <Upload className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-muted-foreground" />
                    <p className="text-xs md:text-body text-muted-foreground">
                      {designSearchQuery || designStatusFilter !== "all"
                        ? "No designs match your filters."
                        : "No designs found."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-4">
                    {filteredDesignsForReview.map((design) => (
                      <div
                        key={design.id}
                        className="bg-white border border-border rounded-lg p-2.5 sm:p-3 md:p-4 lg:p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-2 md:gap-4 mb-2 md:mb-3">
                              {design.imageUrl ? (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-25 md:h-25 lg:w-32 lg:h-32 rounded-lg overflow-hidden border border-border flex-shrink-0">
                                  <img
                                    src={design.imageUrl}
                                    alt={design.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-25 md:h-25 lg:w-32 lg:h-32 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 border border-border">
                                  <Upload className="w-8 h-8 md:w-12 md:h-12 text-primary" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                  <h3 className="text-lg md:text-xl font-medium">{design.title}</h3>
                                  <span
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                                      design.status === "approved"
                                        ? "bg-green-100 text-green-700"
                                        : design.status === "rejected"
                                        ? "bg-red-100 text-red-700"
                                        : design.status === "submitted"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {design.status.toUpperCase()}
                                  </span>
                                </div>
                                {design.designer && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Users className="w-4 h-4" />
                                    <span>
                                      <strong>Designer:</strong> {design.designer.name} ({design.designer.email})
                                    </span>
                                  </div>
                                )}
                                {design.category && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    <strong>Category:</strong> {design.category}
                                  </p>
                                )}
                                {design.description && (
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {design.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>Submitted: {new Date(design.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 md:min-w-[200px]">
                            {design.status === "submitted" && (
                              <>
                                <button
                                  onClick={() => updateDesignStatus(design.id, "approved")}
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors rounded-lg text-sm font-medium"
                                >
                                  <Check className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateDesignStatus(design.id, "rejected")}
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded-lg text-sm font-medium"
                                >
                                  <X className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            )}
                            {design.status !== "submitted" && (
                              <div className="text-sm text-muted-foreground text-center py-2">
                                {design.status === "approved" && (
                                  <div className="flex items-center justify-center gap-2 text-green-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Approved</span>
                                  </div>
                                )}
                                {design.status === "rejected" && (
                                  <div className="flex items-center justify-center gap-2 text-red-600">
                                    <X className="w-4 h-4" />
                                    <span>Rejected</span>
                                  </div>
                                )}
                                {design.status === "draft" && (
                                  <div className="flex items-center justify-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>Draft</span>
                                  </div>
                                )}
                              </div>
                            )}
                            {design.imageUrl && (
                              <a
                                href={design.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-border text-foreground hover:bg-secondary transition-colors rounded-lg text-sm font-medium"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Image
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-medium mb-4">Create User</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                createUser({
                  name: formData.get("name") as string,
                  email: formData.get("email") as string,
                  password: formData.get("password") as string,
                  role: formData.get("role") as string || "member",
                  emailVerified: formData.get("emailVerified") === "on",
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="member">Member</option>
                  <option value="designer">Designer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="emailVerified" id="emailVerified" />
                <label htmlFor="emailVerified" className="text-sm">Email Verified</label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Designer Modal */}
      {showCreateDesignerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-medium mb-4">Create Designer</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                // Reset previews when form is submitted
                setAvatarPreview(null);
                setAvatarFile(null);
                setBannerPreview(null);
                setBannerFile(null);
                const avatarUrl = uploadedAvatarUrl || undefined;
                const bannerUrl = uploadedBannerUrl || undefined;
                setUploadedAvatarUrl(null);
                setUploadedBannerUrl(null);
                createDesigner({
                  name: formData.get("name") as string,
                  email: formData.get("email") as string,
                  password: formData.get("password") as string,
                  bio: formData.get("bio") as string || undefined,
                  portfolioUrl: formData.get("portfolioUrl") as string || undefined,
                  specialties: formData.get("specialties") as string || undefined,
                  avatarUrl: avatarUrl,
                  bannerUrl: bannerUrl,
                  status: formData.get("status") as string || "approved",
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Portfolio URL</label>
                <input
                  type="url"
                  name="portfolioUrl"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specialties</label>
                <input
                  type="text"
                  name="specialties"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Avatar Image</label>
                <div className="space-y-2">
                  {/* Image Preview */}
                  {avatarPreview && (
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-19 md:h-19 lg:w-24 lg:h-24 rounded-lg overflow-hidden border border-border">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide broken image
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarPreview(null);
                          setAvatarFile(null);
                          setUploadedAvatarUrl(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <label
                    htmlFor="avatar-upload-create"
                    className={`flex flex-col items-center justify-center w-full h-24 sm:h-28 md:h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                      uploadingAvatar
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary hover:bg-secondary'
                    }`}
                  >
                    <input
                      type="file"
                      id="avatar-upload-create"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            await handleAvatarUpload(file);
                          } catch (error) {
                            // Error already handled in handleAvatarUpload
                          }
                        }
                      }}
                      disabled={uploadingAvatar}
                    />
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WebP, GIF (max 5MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Banner Image (Hero Background)</label>
                <div className="space-y-2">
                  {/* Banner Preview */}
                  {bannerPreview && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBannerPreview(null);
                          setBannerFile(null);
                          setUploadedBannerUrl(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <label
                    htmlFor="banner-upload-create"
                    className={`flex flex-col items-center justify-center w-full h-24 sm:h-28 md:h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                      uploadingBanner
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary hover:bg-secondary'
                    }`}
                  >
                    <input
                      type="file"
                      id="banner-upload-create"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            await handleBannerUpload(file);
                          } catch (error) {
                            // Error already handled in handleBannerUpload
                          }
                        }
                      }}
                      disabled={uploadingBanner}
                    />
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WebP, GIF (max 10MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateDesignerModal(false);
                    setAvatarPreview(null);
                    setAvatarFile(null);
                    setUploadedAvatarUrl(null);
                    setBannerPreview(null);
                    setBannerFile(null);
                    setUploadedBannerUrl(null);
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Designer Modal */}
      {showEditDesignerModal && editingDesigner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-medium mb-4">Edit Designer</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                // Reset previews when form is submitted
                setAvatarPreview(null);
                setAvatarFile(null);
                setBannerPreview(null);
                setBannerFile(null);
                const avatarUrl = uploadedAvatarUrl || undefined;
                const bannerUrl = uploadedBannerUrl || undefined;
                setUploadedAvatarUrl(null);
                setUploadedBannerUrl(null);
                updateDesignerDetails(editingDesigner.id, {
                  name: formData.get("name") as string,
                  email: formData.get("email") as string,
                  password: formData.get("password") as string || undefined,
                  bio: formData.get("bio") as string || undefined,
                  portfolioUrl: formData.get("portfolioUrl") as string || undefined,
                  specialties: formData.get("specialties") as string || undefined,
                  avatarUrl: avatarUrl,
                  bannerUrl: bannerUrl,
                  status: formData.get("status") as string,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingDesigner.name}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingDesigner.email}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  defaultValue={editingDesigner.bio || ""}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Portfolio URL</label>
                <input
                  type="url"
                  name="portfolioUrl"
                  defaultValue={editingDesigner.portfolioUrl || ""}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specialties</label>
                <input
                  type="text"
                  name="specialties"
                  defaultValue={editingDesigner.specialties || ""}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Avatar Image</label>
                <div className="space-y-2">
                  {/* Current Avatar Preview */}
                  {!avatarPreview && (
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Current avatar</label>
                      {editingDesigner.avatarUrl ? (
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-19 md:h-19 lg:w-24 lg:h-24 rounded-lg overflow-hidden border border-border">
                          <img
                            src={editingDesigner.avatarUrl}
                            alt="Current avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Show placeholder on error
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              const placeholder = img.parentElement?.querySelector('.avatar-placeholder') as HTMLElement;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="avatar-placeholder absolute inset-0 bg-secondary flex items-center justify-center" style={{ display: 'none' }}>
                            <Users className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-secondary flex items-center justify-center">
                          <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* New Upload Preview */}
                  {avatarPreview && (
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-19 md:h-19 lg:w-24 lg:h-24 rounded-lg overflow-hidden border border-border">
                      <img
                        src={avatarPreview}
                        alt="New avatar preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide broken image
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarPreview(null);
                          setAvatarFile(null);
                          setUploadedAvatarUrl(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <label
                    htmlFor="avatar-upload-edit"
                    className={`flex flex-col items-center justify-center w-full h-24 sm:h-28 md:h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                      uploadingAvatar
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary hover:bg-secondary'
                    }`}
                  >
                    <input
                      type="file"
                      id="avatar-upload-edit"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            await handleAvatarUpload(file);
                          } catch (error) {
                            // Error already handled in handleAvatarUpload
                          }
                        }
                      }}
                      disabled={uploadingAvatar}
                    />
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WebP, GIF (max 5MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Banner Image (Hero Background)</label>
                <div className="space-y-2">
                  {/* Current Banner Preview */}
                  {!bannerPreview && editingDesigner.bannerUrl && (
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Current banner</label>
                      <div className="relative w-full h-24 sm:h-28 md:h-32 rounded-lg overflow-hidden border border-border">
                        <img
                          src={editingDesigner.bannerUrl}
                          alt="Current banner"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const placeholder = img.parentElement?.querySelector('.banner-placeholder') as HTMLElement;
                            if (placeholder) {
                              placeholder.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="banner-placeholder absolute inset-0 bg-secondary flex items-center justify-center" style={{ display: 'none' }}>
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* New Upload Preview */}
                  {bannerPreview && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                      <img
                        src={bannerPreview}
                        alt="New banner preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBannerPreview(null);
                          setBannerFile(null);
                          setUploadedBannerUrl(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <label
                    htmlFor="banner-upload-edit"
                    className={`flex flex-col items-center justify-center w-full h-24 sm:h-28 md:h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                      uploadingBanner
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary hover:bg-secondary'
                    }`}
                  >
                    <input
                      type="file"
                      id="banner-upload-edit"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            await handleBannerUpload(file);
                          } catch (error) {
                            // Error already handled in handleBannerUpload
                          }
                        }
                      }}
                      disabled={uploadingBanner}
                    />
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WebP, GIF (max 10MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={editingDesigner.status}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditDesignerModal(false);
                    setEditingDesigner(null);
                    setAvatarPreview(null);
                    setAvatarFile(null);
                    setUploadedAvatarUrl(null);
                    setBannerPreview(null);
                    setBannerFile(null);
                    setUploadedBannerUrl(null);
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showCreateContractModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-medium mb-4">Create Contract</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                createContract({
                  designerId: parseInt(formData.get("designerId") as string),
                  designId: formData.get("designId") ? parseInt(formData.get("designId") as string) : undefined,
                  title: formData.get("title") as string,
                  description: formData.get("description") as string || undefined,
                  amount: formData.get("amount") as string || undefined,
                  status: formData.get("status") as string || "pending",
                  contractFileUrl: uploadedContractFileUrl || undefined,
                });
                // Reset selected designer after submission
                setSelectedDesignerId(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Designer *</label>
                <select
                  name="designerId"
                  required
                  onChange={(e) => {
                    const designerId = parseInt(e.target.value);
                    setSelectedDesignerId(designerId || null);
                  }}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select a designer</option>
                  {designers.map((designer) => (
                    <option key={designer.id} value={designer.id}>
                      {designer.name} ({designer.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Design (optional)</label>
                <select
                  name="designId"
                  disabled={!selectedDesignerId}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select a design</option>
                  {designs
                    .filter((design) => !selectedDesignerId || design.designerId === selectedDesignerId)
                    .map((design) => (
                      <option key={design.id} value={design.id}>
                        {design.title}
                      </option>
                    ))}
                </select>
                {!selectedDesignerId && (
                  <p className="text-xs text-muted-foreground mt-1">Please select a designer first</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="text"
                  name="amount"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="awarded">Awarded</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contract File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleContractFileChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={uploadingContractFile}
                />
                {uploadingContractFile && (
                  <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
                )}
                {uploadedContractFileUrl && !uploadingContractFile && (
                  <p className="text-xs text-green-600 mt-1">✓ File uploaded successfully</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateContractModal(false);
                    setSelectedDesignerId(null);
                    setUploadedContractFileUrl(null);
                    setContractFile(null);
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions Upload Modal */}
      {showTransactionsUploadModal && transactionsUploadUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-medium mb-4">Upload Transactions CSV</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">CSV Format</label>
                <div className="bg-secondary p-4 rounded-lg text-xs font-mono space-y-2">
                  <div><strong>Required columns:</strong> type, amount, points, description</div>
                  <div><strong>Optional columns:</strong> orderId, createdAt</div>
                  <div><strong>Valid types:</strong> purchase, redeem, bonus, birthday_reward, refund</div>
                  <div className="mt-4 font-semibold">Example CSV:</div>
                  <div className="bg-white p-2 rounded border">
                    <div>type,amount,points,description,orderId</div>
                    <div>purchase,125.50,125,Purchase - Order #ORD-10001,ORD-10001</div>
                    <div>redeem,10.00,-100,Redeemed 100 points for $10 off,</div>
                    <div>bonus,0.00,50,Birthday bonus points,</div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Note: Transactions will automatically update the user's points and annual spending. Spending is calculated from purchase and refund transactions.
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Select CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleTransactionsCSVUpload(transactionsUploadUserId, file);
                    }
                  }}
                  disabled={uploadingTransactions}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={downloadTransactionsCSVTemplate}
                  className="px-4 py-2 border border-border text-foreground hover:bg-secondary transition-colors rounded-lg text-sm font-medium"
                >
                  Download CSV Template
                </button>
              </div>
              {uploadingTransactions && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading and processing transactions...</span>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionsUploadModal(false);
                    setTransactionsUploadUserId(null);
                  }}
                  disabled={uploadingTransactions}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contract Modal */}
      {showEditContractModal && editingContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-medium mb-4">Edit Contract</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const designerIdValue = formData.get("designerId") as string;
                const designIdValue = formData.get("designId") as string;
                
                // Ensure designerId is always sent (required field)
                const designerId = designerIdValue && designerIdValue !== "" 
                  ? parseInt(designerIdValue) 
                  : editingContract.designerId;
                
                if (!designerId) {
                  toast.error("Designer is required");
                  return;
                }
                
                const titleValue = (formData.get("title") as string)?.trim();
                if (!titleValue) {
                  toast.error("Title is required");
                  return;
                }
                
                const updates: Partial<Contract> = {
                  title: titleValue,
                  status: formData.get("status") as string,
                  designerId: designerId,
                };
                
                const description = (formData.get("description") as string)?.trim() || "";
                const amount = (formData.get("amount") as string)?.trim() || "";
                
                const updatePayload: any = { ...updates };
                updatePayload.description = description || null;
                updatePayload.amount = amount || null;
                
                if (designIdValue && designIdValue !== "") {
                  updatePayload.designId = parseInt(designIdValue);
                } else if (editingContract.designId) {
                  updatePayload.designId = null;
                }
                
                await updateContract(editingContract.id, updatePayload);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Designer *</label>
                <select
                  name="designerId"
                  defaultValue={editingContract.designerId}
                  required
                  onChange={(e) => {
                    const designerId = parseInt(e.target.value);
                    setSelectedDesignerId(designerId || null);
                  }}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select a designer</option>
                  {designers.map((designer) => (
                    <option key={designer.id} value={designer.id}>
                      {designer.name} ({designer.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Design (optional)</label>
                <select
                  name="designId"
                  defaultValue={editingContract.designId || ""}
                  disabled={!selectedDesignerId && !editingContract.designerId}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select a design</option>
                  {designs
                    .filter((design) => {
                      const filterDesignerId = selectedDesignerId || editingContract.designerId;
                      return !filterDesignerId || design.designerId === filterDesignerId;
                    })
                    .map((design) => (
                      <option key={design.id} value={design.id}>
                        {design.title}
                      </option>
                    ))}
                </select>
                {!selectedDesignerId && !editingContract.designerId && (
                  <p className="text-xs text-muted-foreground mt-1">Please select a designer first</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingContract.title}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingContract.description || ""}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="text"
                  name="amount"
                  defaultValue={editingContract.amount || ""}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={editingContract.status}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="awarded">Awarded</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditContractModal(false);
                    setEditingContract(null);
                    setSelectedDesignerId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contract Details Modal */}
      {showContractDetailsModal && viewingContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium">Contract Details</h2>
              <button
                onClick={() => {
                  setShowContractDetailsModal(false);
                  setViewingContract(null);
                  setContractDocuments([]);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-4 pb-2 border-b">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <p className="text-base mt-1">{viewingContract.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium inline-block ${
                          viewingContract.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : viewingContract.status === "awarded"
                            ? "bg-blue-100 text-blue-700"
                            : viewingContract.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {viewingContract.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {viewingContract.designer && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Designer Name</label>
                        <p className="text-base mt-1">{viewingContract.designer.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Designer Email</label>
                        <p className="text-base mt-1">{viewingContract.designer.email}</p>
                      </div>
                    </>
                  )}
                  {viewingContract.amount && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Amount</label>
                      <p className="text-base mt-1">${viewingContract.amount}</p>
                    </div>
                  )}
                  {viewingContract.designId && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Design ID</label>
                      <p className="text-base mt-1">{viewingContract.designId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {viewingContract.description && (
                <div>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Description</h3>
                  <p className="text-base text-muted-foreground whitespace-pre-wrap">{viewingContract.description}</p>
                </div>
              )}

              {/* Dates */}
              <div>
                <h3 className="text-lg font-medium mb-4 pb-2 border-b">Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created At</label>
                    <p className="text-base mt-1">
                      {new Date(viewingContract.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {viewingContract.awardedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Awarded At</label>
                      <p className="text-base mt-1">
                        {new Date(viewingContract.awardedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {viewingContract.completedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Completed At</label>
                      <p className="text-base mt-1">
                        {new Date(viewingContract.completedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {viewingContract.signedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Signed At</label>
                      <p className="text-base mt-1">
                        {new Date(viewingContract.signedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Envelope Information */}
              {(viewingContract.envelopeId || viewingContract.envelopeStatus || viewingContract.envelopeUrl) && (
                <div>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Envelope Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingContract.envelopeId && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Envelope ID</label>
                        <p className="text-base mt-1 font-mono text-sm">{viewingContract.envelopeId}</p>
                      </div>
                    )}
                    {viewingContract.envelopeStatus && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Envelope Status</label>
                        <p className="text-base mt-1">{viewingContract.envelopeStatus}</p>
                      </div>
                    )}
                    {viewingContract.envelopeUrl && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Envelope URL</label>
                        <a
                          href={viewingContract.envelopeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base mt-1 text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                        >
                          {viewingContract.envelopeUrl}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PDF Documents */}
              <div>
                <h3 className="text-lg font-medium mb-4 pb-2 border-b">Documents</h3>
                <div className="space-y-3">
                  {loadingContractDocuments ? (
                    <div className="border border-border rounded-lg p-4 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
                      <p className="text-sm">Loading documents...</p>
                    </div>
                  ) : (
                    <>
                      {viewingContract.contractFileUrl && (() => {
                        const contractFileUrl = viewingContract.contractFileUrl;
                        const fileIdMatch = contractFileUrl?.match(/\/api\/files\/(\d+)/);
                        const downloadUrl = fileIdMatch 
                          ? `${contractFileUrl}?download=true`
                          : contractFileUrl;
                        
                        return (
                        <div className="border border-border rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileTextIcon className="w-8 h-8 text-red-600" />
                            <div>
                              <p className="font-medium">Contract PDF</p>
                              <p className="text-sm text-muted-foreground">Contract document</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                                href={contractFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 border border-border hover:bg-secondary transition-colors rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View
                            </a>
                            <a
                                href={downloadUrl}
                                download="contract.pdf"
                              className="px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                        </div>
                        );
                      })()}
                      {contractDocuments.map((doc) => {
                        // Extract file ID from fileUrl (format: /api/files/{id})
                        const fileIdMatch = doc.fileUrl?.match(/\/api\/files\/(\d+)/);
                        const downloadUrl = fileIdMatch 
                          ? `${doc.fileUrl}?download=true`
                          : doc.fileUrl;
                        const fileName = doc.fileName || doc.title || 'document';
                        
                        return (
                        <div key={doc.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileTextIcon className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-sm text-muted-foreground">{doc.description || doc.fileName}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 border border-border hover:bg-secondary transition-colors rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View
                            </a>
                            <a
                                href={downloadUrl}
                                download={fileName}
                              className="px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                        </div>
                        );
                      })}
                      {!viewingContract.contractFileUrl && contractDocuments.length === 0 && (
                        <div className="border border-border rounded-lg p-4 text-center text-muted-foreground">
                          <FileTextIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No contract document available</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    const contractToEdit = viewingContract;
                    setShowContractDetailsModal(false);
                    setContractDocuments([]);
                    setViewingContract(null);
                    if (contractToEdit) {
                      setEditingContract(contractToEdit);
                      setSelectedDesignerId(contractToEdit.designerId);
                    setShowEditContractModal(true);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-border text-foreground hover:bg-secondary transition-colors rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Contract
                </button>
                <button
                  onClick={() => {
                    setShowContractDetailsModal(false);
                    setViewingContract(null);
                    setContractDocuments([]);
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-medium mb-4">Edit Product</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                updateProduct(editingProduct.id, {
                  name: formData.get("name") as string,
                  description: formData.get("description") as string || undefined,
                  price: formData.get("price") as string,
                  category: formData.get("category") as string || undefined,
                  imageUrl: formData.get("imageUrl") as string || undefined,
                  stock: formData.get("stock") ? parseInt(formData.get("stock") as string) : undefined,
                  sku: formData.get("sku") as string || undefined,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct.name}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingProduct.description || ""}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="text"
                  name="price"
                  defaultValue={editingProduct.price}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  defaultValue={editingProduct.category || ""}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  defaultValue={editingProduct.imageUrl || ""}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  name="stock"
                  defaultValue={editingProduct.stock || 0}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  name="sku"
                  defaultValue={editingProduct.sku || ""}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal for Designer */}
      {showUploadDocumentModal && uploadingDocumentForDesigner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
              <h3 className="text-2xl font-medium">
                Upload Document for {designers.find(d => d.id === uploadingDocumentForDesigner)?.name || 'Designer'}
              </h3>
              <button
                onClick={() => {
                  setShowUploadDocumentModal(false);
                  setUploadingDocumentForDesigner(null);
                  setAdminDocumentForm({
                    title: '',
                    description: '',
                    category: '',
                    fileUrl: '',
                    fileName: '',
                    fileSize: 0,
                    fileType: '',
                    file: null,
                  });
                }}
                className="p-2 hover:bg-secondary rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={adminDocumentForm.title}
                  onChange={(e) => setAdminDocumentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter document title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={adminDocumentForm.description}
                  onChange={(e) => setAdminDocumentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  placeholder="Describe the document..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={adminDocumentForm.category}
                  onChange={(e) => setAdminDocumentForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Contract, Reference, Guidelines, Other"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Document File <span className="text-red-600">*</span>
                </label>
                {adminDocumentForm.fileUrl ? (
                  <div className="space-y-2">
                    <div className="p-4 bg-secondary border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{adminDocumentForm.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(adminDocumentForm.fileSize)} • {adminDocumentForm.fileType}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setAdminDocumentForm(prev => ({ 
                            ...prev, 
                            fileUrl: '', 
                            fileName: '', 
                            fileSize: 0, 
                            fileType: '',
                            file: null 
                          }))}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp,.gif"
                      onChange={handleAdminDocumentFileChange}
                      className="hidden"
                      id="admin-document-file-upload"
                      disabled={uploadingDocument}
                    />
                    <label
                      htmlFor="admin-document-file-upload"
                      className={`cursor-pointer inline-flex flex-col items-center gap-2 ${uploadingDocument ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploadingDocument ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-xs text-muted-foreground">
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
                  onClick={() => {
                    setShowUploadDocumentModal(false);
                    setUploadingDocumentForDesigner(null);
                    setAdminDocumentForm({
                      title: '',
                      description: '',
                      category: '',
                      fileUrl: '',
                      fileName: '',
                      fileSize: 0,
                      fileType: '',
                      file: null,
                    });
                  }}
                  className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAdminDocument}
                  disabled={!adminDocumentForm.title.trim() || !adminDocumentForm.fileUrl || uploadingDocument}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

