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
  FileSignature
} from "lucide-react";
import Footer from "@/components/sections/footer";
import { SigningFrame } from "@/components/docusign/SigningFrame";

interface Designer {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  specialties: string | null;
  status: string;
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

export default function DesignerDashboardPage() {
  const router = useRouter();
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "designs" | "contracts">("overview");
  const [signingContract, setSigningContract] = useState<Contract | null>(null);

  useEffect(() => {
    const designerData = localStorage.getItem("designer");
    if (!designerData) {
      router.push("/designers/login");
      return;
    }

    const parsedDesigner = JSON.parse(designerData);
    setDesigner(parsedDesigner);

    fetchDashboardData(parsedDesigner.id);
  }, [router]);

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
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("designer");
    router.push("/designers");
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

  if (loading || !designer) {
    return (
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
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
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-white border border-border p-6">
                <h3 className="text-xl font-medium mb-4">PROFILE INFORMATION</h3>
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

          {/* Designs Tab */}
          {activeTab === "designs" && (
            <div>
              {designs.length === 0 ? (
                <div className="text-center py-12 bg-white border border-border">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">You haven't created any designs yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {designs.map((design) => (
                    <div key={design.id} className="bg-white border border-border p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium">{design.title}</h4>
                        <span className={`text-caption px-2 py-1 ${
                          design.status === "approved" ? "bg-green-100 text-green-800" :
                          design.status === "submitted" ? "bg-blue-100 text-blue-800" :
                          design.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {design.status}
                        </span>
                      </div>
                      {design.description && (
                        <p className="text-body-small text-muted-foreground mb-3 line-clamp-2">
                          {design.description}
                        </p>
                      )}
                      {design.category && (
                        <p className="text-caption text-muted-foreground mb-3">
                          Category: {design.category}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteDesign(design.id)}
                          className="flex-1 px-3 py-2 border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors text-body-small"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
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
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}