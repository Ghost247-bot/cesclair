"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
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
  FileText
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
  createdAt: string;
  updatedAt: string;
}

interface Product {
  name: string;
  price: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  stock?: number;
  sku?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const [activeTab, setActiveTab] = useState<"designers" | "products">("designers");
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [filteredDesigners, setFilteredDesigners] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const isAuthenticated = !sessionPending && session?.user;
  const isAdmin = (session?.user as any)?.role === "admin";
  const shouldShowContent = isAuthenticated && isAdmin;

  // Fetch designers when admin is confirmed
  useEffect(() => {
    if (shouldShowContent) {
      fetchDesigners();
    }
  }, [shouldShowContent]);

  // Filter designers based on search and status
  useEffect(() => {
    let filtered = designers;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
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
  }, [designers, searchQuery, statusFilter]);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/designers?limit=100", {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDesigners(data);
        setFilteredDesigners(data);
      } else {
        toast.error("Failed to load designers");
      }
    } catch (error) {
      console.error("Failed to fetch designers:", error);
      toast.error("Failed to load designers");
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
      console.error("Failed to update designer status:", error);
      toast.error("Failed to update designer status");
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
      console.error("Failed to delete designer:", error);
      toast.error("Failed to delete designer");
    }
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

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const products: Product[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(",").map((v) => v.trim());
        const product: any = {};

        headers.forEach((header, index) => {
          if (values[index]) {
            product[header] = values[index];
          }
        });

        if (product.name && product.price) {
          products.push(product);
        }
      }

      if (products.length === 0) {
        setUploadResult("No valid products found in CSV file.");
        toast.error("No valid products found");
        return;
      }

      const response = await fetch("/api/products/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ products }),
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(
          `Successfully uploaded ${data.created} products. ${
            data.failed > 0 ? `${data.failed} failed.` : ""
          }`
        );
        toast.success("Products uploaded successfully");
      } else {
        setUploadResult(`Upload failed: ${data.error || "Unknown error"}`);
        toast.error("Upload failed");
      }
    } catch (error) {
      setUploadResult(`Upload error: ${error instanceof Error ? error.message : "Unknown error"}`);
      toast.error("Upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!sessionPending) {
      if (!isAuthenticated) {
        router.push("/cesworld/login");
      } else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [sessionPending, isAuthenticated, isAdmin, router]);

  // Show loading state while checking session
  if (sessionPending || (!isAuthenticated && !sessionPending)) {
    return (
      <>
        <HeaderNavigation />
        <div className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-body text-muted-foreground">Loading admin panel...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show access denied if not admin (but only after session is loaded)
  if (!shouldShowContent) {
    return (
      <>
        <HeaderNavigation />
        <div className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-medium mb-2">Access Denied</h2>
            <p className="text-body text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const statusCounts = {
    all: designers.length,
    pending: designers.filter((d) => d.status === "pending").length,
    approved: designers.filter((d) => d.status === "approved").length,
    rejected: designers.filter((d) => d.status === "rejected").length,
  };

  return (
    <>
      <HeaderNavigation />
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
        {/* Header Section */}
        <section className="bg-white border-b border-border">
          <div className="container mx-auto px-6 md:px-8 py-8 md:py-12">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-medium">Admin Dashboard</h1>
                <p className="text-body text-muted-foreground mt-1">
                  Manage designers and products
                </p>
              </div>
            </div>
            {session?.user && (
              <div className="mt-4 text-sm text-muted-foreground">
                Logged in as <span className="font-medium text-foreground">{session.user.email}</span>
              </div>
            )}
          </div>
        </section>

        {/* Tabs Navigation */}
        <section className="bg-white border-b border-border sticky top-[60px] md:top-[64px] z-10">
          <div className="container mx-auto px-6 md:px-8">
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab("designers")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "designers"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Designers ({statusCounts.all})
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "products"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Products
              </button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-6 md:px-8">
            {/* Designers Tab */}
            {activeTab === "designers" && (
              <div>
                {/* Filters */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
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
                      <option value="all">All Status ({statusCounts.all})</option>
                      <option value="pending">Pending ({statusCounts.pending})</option>
                      <option value="approved">Approved ({statusCounts.approved})</option>
                      <option value="rejected">Rejected ({statusCounts.rejected})</option>
                    </select>
                  </div>
                </div>

                {/* Designers List */}
                {loading ? (
                  <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-body text-muted-foreground">Loading designers...</p>
                  </div>
                ) : filteredDesigners.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-border rounded-lg">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-body text-muted-foreground">
                      {searchQuery || statusFilter !== "all"
                        ? "No designers match your filters."
                        : "No designers found."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDesigners.map((designer) => (
                      <div
                        key={designer.id}
                        className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-3">
                              {designer.avatarUrl ? (
                                <img
                                  src={designer.avatarUrl}
                                  alt={designer.name}
                                  className="w-12 h-12 rounded-full object-cover"
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

            {/* Products CSV Upload Tab */}
            {activeTab === "products" && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white border border-border rounded-lg p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-medium mb-2">Bulk Product Upload</h2>
                    <p className="text-body text-muted-foreground">
                      Upload a CSV file to add multiple products at once
                    </p>
                  </div>

                  <div className="mb-8 p-6 bg-secondary rounded-lg">
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      CSV Format Requirements
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-2 mb-4">
                      <p><strong>Required columns:</strong> name, price</p>
                      <p><strong>Optional columns:</strong> description, category, imageUrl, stock, sku</p>
                      <p>• First row must contain column headers</p>
                      <p>• Use comma (,) as delimiter</p>
                    </div>
                    <div className="p-4 bg-white border border-border rounded text-xs font-mono overflow-x-auto">
                      <div className="text-muted-foreground mb-2">Example:</div>
                      <div>name,price,description,category,stock,sku</div>
                      <div>Product Name,99.99,Product description,category,10,SKU-001</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="csv-upload"
                      className="block w-full px-8 py-12 border-2 border-dashed border-border hover:border-primary transition-colors rounded-lg cursor-pointer text-center bg-secondary/50 hover:bg-secondary"
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

                  {uploadResult && (
                    <div
                      className={`p-4 rounded-lg ${
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
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

