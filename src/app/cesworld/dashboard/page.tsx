"use client";

import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Star, Gift, TrendingUp, LogOut } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/sections/footer";

interface Member {
  id: number;
  userId: string;
  tier: string;
  points: number;
  annualSpending: string;
  birthdayMonth: number | null;
  birthdayDay: number | null;
  joinedAt: string;
  lastTierUpdate: string;
}

interface Transaction {
  id: number;
  memberId: number;
  type: string;
  amount: string;
  points: number;
  description: string;
  orderId: string | null;
  createdAt: string;
}

interface Reward {
  id: number;
  memberId: number;
  rewardType: string;
  pointsCost: number;
  amountOff: string;
  status: string;
  redeemedAt: string;
  usedAt: string | null;
  expiresAt: string;
}

export default function CesworldDashboard() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "rewards">("overview");

  // Redirect if not authenticated or wrong role
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/cesworld/login");
    } else if (!isPending && session?.user) {
      const role = session.user.role || 'member';
      const userEmail = session.user.email;
      
      // Check if user is in designers table - redirect to designers dashboard
      if (userEmail) {
        fetch(`/api/designers/by-email?email=${encodeURIComponent(userEmail)}`)
          .then(res => res.json())
          .then(data => {
            if (data.exists && data.status === 'approved') {
              router.push("/designers/dashboard");
              return;
            }
            
            // If not a designer, check role
            if (role === 'admin') {
              router.push("/admin");
            }
          })
          .catch(() => {
            // On error, check role
            if (role === 'admin') {
              router.push("/admin");
            } else if (role === 'designer') {
              router.push("/designers/dashboard");
            }
          });
      } else {
        // No email, use role check
      if (role === 'admin') {
        router.push("/admin");
        } else if (role === 'designer') {
          router.push("/designers/dashboard");
        }
      }
    }
  }, [session, isPending, router]);

  // Fetch member data
  useEffect(() => {
    const fetchMemberData = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch member profile (API doesn't require bearer token, uses session cookies)
        const memberRes = await fetch(`/api/cesworld/members/user/${session.user.id}`, {
          credentials: 'include',
        });

        if (memberRes.ok) {
          const memberData = await memberRes.json();
          setMember(memberData);

          // Fetch transactions
          const transactionsRes = await fetch(`/api/cesworld/transactions/member/${memberData.id}?limit=10`, {
            credentials: 'include',
          });

          if (transactionsRes.ok) {
            const transactionsData = await transactionsRes.json();
            setTransactions(transactionsData);
          }

          // Fetch rewards
          const rewardsRes = await fetch(`/api/cesworld/rewards/member/${memberData.id}`, {
            credentials: 'include',
          });

          if (rewardsRes.ok) {
            const rewardsData = await rewardsRes.json();
            setRewards(rewardsData);
          }
        } else if (memberRes.status === 404) {
          // Member profile doesn't exist, create it
          const createRes = await fetch("/api/cesworld/members", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({
              userId: session.user.id,
            }),
          });

          if (createRes.ok) {
            const newMember = await createRes.json();
            setMember(newMember);
          } else {
            const errorData = await createRes.json().catch(() => null);
            console.error("Failed to create member profile:", createRes.status, createRes.statusText, errorData);
            toast.error("Failed to create member profile. Please try again.");
          }
        } else {
          const errorData = await memberRes.json().catch(() => null);
          console.error("Failed to fetch member data:", memberRes.status, memberRes.statusText, errorData);
          toast.error("Failed to load member data. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching member data:", error);
        toast.error("Failed to load member data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchMemberData();
    } else if (!isPending) {
      // If session is not pending and no user, stop loading
      setIsLoading(false);
    }
  }, [session, isPending]);

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/cesworld");
    }
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case "member":
        return {
          name: "MEMBER",
          range: "$0 - $499 annually",
          nextTier: "PLUS",
          nextThreshold: 500,
          color: "text-primary",
          bgColor: "bg-secondary",
        };
      case "plus":
        return {
          name: "PLUS",
          range: "$500 - $999 annually",
          nextTier: "PREMIER",
          nextThreshold: 1000,
          color: "text-primary",
          bgColor: "bg-accent",
        };
      case "premier":
        return {
          name: "PREMIER",
          range: "$1000+ annually",
          nextTier: null,
          nextThreshold: null,
          color: "text-primary",
          bgColor: "bg-accent-foreground/10",
        };
      default:
        return {
          name: "MEMBER",
          range: "$0 - $499 annually",
          nextTier: "PLUS",
          nextThreshold: 500,
          color: "text-primary",
          bgColor: "bg-secondary",
        };
    }
  };

  const getProgressToNextTier = () => {
    if (!member) return 0;
    const spending = parseFloat(member.annualSpending);
    const tierInfo = getTierInfo(member.tier);
    
    if (!tierInfo.nextThreshold) return 100; // Already at highest tier
    
    let currentThreshold = 0;
    if (member.tier === "plus") currentThreshold = 500;
    
    const progress = ((spending - currentThreshold) / (tierInfo.nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (isPending || isLoading) {
    return (
      <div className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-body text-muted-foreground mb-4">Please log in to view your dashboard.</p>
          <Link
            href="/cesworld/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <span className="text-button-primary">GO TO LOGIN</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-body text-muted-foreground mb-4">Loading your membership data...</p>
          <p className="text-body-small text-muted-foreground">If this takes too long, please refresh the page.</p>
        </div>
      </div>
    );
  }

  const tierInfo = getTierInfo(member.tier);
  const progress = getProgressToNextTier();
  const activeRewards = rewards.filter((r) => r.status === "active");
  const usedRewards = rewards.filter((r) => r.status === "used");

  return (
    <>
    <main className="pt-[48px] sm:pt-[51px] md:pt-[54px] lg:pt-[57px] min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-5 lg:px-6 py-12 sm:py-14 md:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-9 sm:mb-10 md:mb-12">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium mb-1.5 sm:mb-2">
              Welcome back, {session.user.name?.split(" ")[0]}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Manage your membership, view your points, and track your rewards
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-3 sm:mt-4 md:mt-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 border border-primary text-primary hover:bg-secondary transition-colors text-xs sm:text-sm"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-button-secondary">SIGN OUT</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-9 sm:mb-10 md:mb-12">
          {/* Tier Card */}
          <div className={`${tierInfo.bgColor} p-6 sm:p-7 md:p-8`}>
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
              <Star className="w-5 h-5 sm:w-6 sm:h-6" />
              <h3 className="text-base sm:text-lg md:text-xl font-medium">Current Tier</h3>
            </div>
            <div className="text-2xl sm:text-2.5xl md:text-3xl font-medium mb-1.5 sm:mb-2">{tierInfo.name}</div>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{tierInfo.range}</p>
          </div>

          {/* Points Card */}
          <div className="bg-secondary p-6 sm:p-7 md:p-8">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
              <h3 className="text-base sm:text-lg md:text-xl font-medium">Available Points</h3>
            </div>
            <div className="text-2xl sm:text-2.5xl md:text-3xl font-medium mb-1.5 sm:mb-2">{member.points.toLocaleString()}</div>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
              ${(member.points / 10).toFixed(2)} in rewards
            </p>
          </div>

          {/* Annual Spending Card */}
          <div className="bg-secondary p-6 sm:p-7 md:p-8">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              <h3 className="text-base sm:text-lg md:text-xl font-medium">Annual Spending</h3>
            </div>
            <div className="text-2xl sm:text-2.5xl md:text-3xl font-medium mb-1.5 sm:mb-2">
              {formatCurrency(member.annualSpending)}
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">This calendar year</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {tierInfo.nextTier && (
          <div className="bg-secondary p-6 sm:p-7 md:p-8 mb-9 sm:mb-10 md:mb-12">
            <h3 className="text-base sm:text-lg md:text-xl font-medium mb-3 sm:mb-4">
              Progress to {tierInfo.nextTier}
            </h3>
            <div className="mb-2.5 sm:mb-3">
              <div className="w-full bg-white h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
              Spend {formatCurrency((tierInfo.nextThreshold! - parseFloat(member.annualSpending)).toFixed(2))} more to reach {tierInfo.nextTier} tier
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-border mb-6 sm:mb-7 md:mb-8">
          <div className="flex gap-6 sm:gap-7 md:gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 sm:pb-3.5 md:pb-4 text-navigation transition-colors whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`pb-3 sm:pb-3.5 md:pb-4 text-navigation transition-colors whitespace-nowrap ${
                activeTab === "transactions"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              TRANSACTIONS
            </button>
            <button
              onClick={() => setActiveTab("rewards")}
              className={`pb-3 sm:pb-3.5 md:pb-4 text-navigation transition-colors whitespace-nowrap ${
                activeTab === "rewards"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              REWARDS
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Membership Benefits */}
            <div>
              <h2 className="text-2xl font-medium mb-6">Your Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-border p-6">
                  <h3 className="text-lg font-medium mb-3">Earn Points</h3>
                  <p className="text-body text-muted-foreground">
                    {member.tier === "member" && "Get 1 point for every $1 spent"}
                    {member.tier === "plus" && "Get 1.25 points for every $1 spent"}
                    {member.tier === "premier" && "Get 1.5 points for every $1 spent"}
                  </p>
                </div>
                <div className="border border-border p-6">
                  <h3 className="text-lg font-medium mb-3">Birthday Reward</h3>
                  <p className="text-body text-muted-foreground">
                    Receive a special gift on your birthday
                  </p>
                </div>
                <div className="border border-border p-6">
                  <h3 className="text-lg font-medium mb-3">Free Shipping</h3>
                  <p className="text-body text-muted-foreground">
                    {member.tier === "member" && "On orders over $99"}
                    {(member.tier === "plus" || member.tier === "premier") && "On all orders"}
                  </p>
                </div>
                <div className="border border-border p-6">
                  <h3 className="text-lg font-medium mb-3">Early Access</h3>
                  <p className="text-body text-muted-foreground">
                    {member.tier === "member" && "Shop sales before anyone else"}
                    {(member.tier === "plus" || member.tier === "premier") && "Exclusive member-only sales"}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-2xl font-medium mb-6">Recent Activity</h2>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between border-b border-border pb-4"
                    >
                      <div>
                        <p className="text-body font-medium">{transaction.description}</p>
                        <p className="text-body-small text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-body font-medium">
                          {transaction.points > 0 ? "+" : ""}
                          {transaction.points} points
                        </p>
                        <p className="text-body-small text-muted-foreground">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-body text-muted-foreground">No transactions yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div>
            <h2 className="text-2xl font-medium mb-6">Transaction History</h2>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b border-border pb-4"
                  >
                    <div className="flex-1">
                      <p className="text-body font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-body-small text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                        <span
                          className={`text-label px-2 py-0.5 ${
                            transaction.type === "purchase"
                              ? "bg-secondary"
                              : transaction.type === "redeem"
                              ? "bg-accent"
                              : "bg-accent-foreground/10"
                          }`}
                        >
                          {transaction.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-body font-medium ${
                          transaction.points > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.points > 0 ? "+" : ""}
                        {transaction.points} points
                      </p>
                      <p className="text-body-small text-muted-foreground">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body text-muted-foreground">No transactions yet</p>
            )}
          </div>
        )}

        {activeTab === "rewards" && (
          <div>
            <h2 className="text-2xl font-medium mb-6">Your Rewards</h2>
            
            {/* Active Rewards */}
            {activeRewards.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4">Active Rewards</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {activeRewards.map((reward) => (
                    <div key={reward.id} className="border border-border p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-label bg-secondary px-3 py-1">
                          {reward.rewardType.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="text-body font-medium">
                          {formatCurrency(reward.amountOff)} OFF
                        </span>
                      </div>
                      <p className="text-body-small text-muted-foreground mb-2">
                        Redeemed {formatDate(reward.redeemedAt)}
                      </p>
                      <p className="text-body-small text-muted-foreground">
                        Expires {formatDate(reward.expiresAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Used Rewards */}
            {usedRewards.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-4">Used Rewards</h3>
                <div className="space-y-4">
                  {usedRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between border-b border-border pb-4 opacity-60"
                    >
                      <div>
                        <p className="text-body font-medium">
                          {reward.rewardType.replace("_", " ")} - {formatCurrency(reward.amountOff)} OFF
                        </p>
                        <p className="text-body-small text-muted-foreground">
                          Used {reward.usedAt ? formatDate(reward.usedAt) : "N/A"}
                        </p>
                      </div>
                      <span className="text-label bg-secondary px-3 py-1">USED</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeRewards.length === 0 && usedRewards.length === 0 && (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-body text-muted-foreground mb-6">
                  You don't have any rewards yet. Keep shopping to earn more points!
                </p>
                <Link
                  href="/women/new-arrivals"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <span className="text-button-primary">START SHOPPING</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Redeem Points Info */}
            <div className="mt-8 bg-secondary p-8">
              <h3 className="text-xl font-medium mb-3">Redeem Your Points</h3>
              <p className="text-body text-muted-foreground mb-4">
                Every 100 points = $10 off your next purchase. You can redeem your points at checkout.
              </p>
              <p className="text-body font-medium">
                Available to redeem: {formatCurrency(((Math.floor(member.points / 100) * 100) / 10).toFixed(2))}
              </p>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 text-center bg-gradient-to-br from-accent to-accent-background p-12">
          <h2 className="text-2xl md:text-3xl font-medium mb-4">
            Keep Shopping, Keep Earning
          </h2>
          <p className="text-body-large text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every purchase brings you closer to exclusive rewards and your next tier
          </p>
          <Link
            href="/women/new-arrivals"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <span className="text-button-primary">SHOP NEW ARRIVALS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}