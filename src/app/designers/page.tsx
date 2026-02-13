import Link from "next/link";
import Image from "next/image";
import { Users, ArrowRight, Briefcase } from "lucide-react";
import { normalizeImagePath } from "@/lib/utils";

// Database imports for runtime data fetching
// import { db } from "@/db";
// import { designers } from "@/db/schema";
// import { eq, desc } from "drizzle-orm";

// Mock data for build-time static generation
const mockApprovedDesigners = [
  {
    id: 1,
    name: "Alexandra Rivera",
    email: "alexandra@designer.com",
    bio: "Fashion designer specializing in sustainable luxury womenswear with a focus on ethical production",
    portfolioUrl: "https://portfolio.alexandrarivera.com",
    specialties: "Sustainable Fashion, Luxury Womenswear, Ethical Production",
    status: "approved",
    avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "James Mitchell",
    email: "james@designer.com",
    bio: "Contemporary menswear designer blending classic tailoring with modern streetwear aesthetics",
    portfolioUrl: "https://portfolio.jamesmitchell.com",
    specialties: "Menswear, Streetwear, Tailoring, Accessories",
    status: "approved",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1520880638454-ffb6c90f4d1c?auto=format&fit=crop&w=1920&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Sofia Chen",
    email: "sofia@designer.com",
    bio: "Avant-garde designer known for experimental silhouettes and innovative textile techniques",
    portfolioUrl: "https://portfolio.sofiachen.com",
    specialties: "Avant-garde, Textile Innovation, Experimental Design",
    status: "approved",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

async function getApprovedDesigners() {
  // During build time, return mock data to avoid database calls
  if (typeof window === 'undefined') {
    return mockApprovedDesigners;
  }
  
  try {
    // Only import database at runtime
    const { db } = await import('@/db');
    const { designers } = await import('@/db/schema');
    const { eq, desc } = await import('drizzle-orm');
    
    const results = await db
      .select({
        id: designers.id,
        name: designers.name,
        email: designers.email,
        bio: designers.bio,
        portfolioUrl: designers.portfolioUrl,
        specialties: designers.specialties,
        status: designers.status,
        avatarUrl: designers.avatarUrl,
        bannerUrl: designers.bannerUrl,
        createdAt: designers.createdAt,
        updatedAt: designers.updatedAt,
      })
      .from(designers)
      .where(eq(designers.status, "approved"))
      .orderBy(desc(designers.createdAt))
      .limit(50);

    return results;
  } catch (error) {
    console.error('Error fetching designers:', error);
    // Fallback to mock data if database fails
    return mockApprovedDesigners;
  }
}

export default async function DesignersPage() {
  const approvedDesigners = await getApprovedDesigners();

  return (
    <div className="min-h-screen bg-white pt-[60px] md:pt-[64px]">
      {/* Hero Section with Background Image */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://cdn.builder.io/api/v1/image/assets%2F444142b2cae54a19aeb8b5ba245feffe%2F1a4d70acbcdc4dbf89c5d9845bd9d8b5"
          alt="Our Designers"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6 tracking-tight">
            Our Designers
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto">
            Discover talented fashion designers and creators shaping the future of sustainable fashion
          </p>
        </div>
      </section>

      {/* Designers Grid */}
      <section className="container mx-auto py-12 px-4">
        {approvedDesigners.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Designers Yet</h2>
            <p className="text-muted-foreground mb-6">
              Check back soon to discover our talented designers
            </p>
            <Link
              href="/designers/apply"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Become a Designer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Featured Designers ({approvedDesigners.length})
              </h2>
              <p className="text-muted-foreground">
                Explore portfolios and connect with our talented designers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedDesigners.map((designer) => (
                <Link
                  key={designer.id}
                  href={`/designers/${designer.id}`}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Banner Image */}
                  <div className="relative h-48 bg-secondary overflow-hidden">
                    {designer.bannerUrl ? (
                      <Image
                        src={normalizeImagePath(designer.bannerUrl)}
                        alt={`${designer.name} banner`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Designer Info */}
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                        {designer.avatarUrl ? (
                          <Image
                            src={normalizeImagePath(designer.avatarUrl)}
                            alt={designer.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <Users className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {designer.name}
                        </h3>
                        {designer.specialties && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {designer.specialties}
                          </p>
                        )}
                      </div>
                    </div>

                    {designer.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {designer.bio}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-primary group-hover:underline">
                      View Portfolio
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center bg-secondary rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-2">Are You a Designer?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join our community of talented designers and showcase your work to a global audience
              </p>
              <Link
                href="/designers/apply"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Apply to Become a Designer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
