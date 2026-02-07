import Link from "next/link";
import Image from "next/image";
import { Scissors, ArrowRight, Briefcase } from "lucide-react";
import { normalizeImagePath } from "@/lib/utils";
import { db } from "@/db";
import { hairstylists } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

async function getApprovedHairstylists() {
  const results = await db
    .select({
      id: hairstylists.id,
      name: hairstylists.name,
      email: hairstylists.email,
      bio: hairstylists.bio,
      portfolioUrl: hairstylists.portfolioUrl,
      specialties: hairstylists.specialties,
      status: hairstylists.status,
      avatarUrl: hairstylists.avatarUrl,
      bannerUrl: hairstylists.bannerUrl,
      createdAt: hairstylists.createdAt,
      updatedAt: hairstylists.updatedAt,
    })
    .from(hairstylists)
    .where(eq(hairstylists.status, "approved"))
    .orderBy(desc(hairstylists.createdAt))
    .limit(50);

  return results;
}

export default async function HairstylistsPage() {
  const approved = await getApprovedHairstylists();

  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80"
          alt="Our Hairstylists"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6 tracking-tight">
            Our Hairstylists
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto">
            Discover talented hairstylists and explore their portfolios
          </p>
        </div>
      </section>

      <section className="container mx-auto py-12 px-4">
        {approved.length === 0 ? (
          <div className="text-center py-12">
            <Scissors className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Hairstylists Yet</h2>
            <p className="text-muted-foreground mb-4">
              Check back soon to discover our hairstylist portfolios
            </p>
            <Link
              href="/hairstylists/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Hairstylist log in
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Featured Hairstylists ({approved.length})
              </h2>
              <p className="text-muted-foreground">
                Explore portfolios and connect with our talented hairstylists
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approved.map((stylist) => (
                <Link
                  key={stylist.id}
                  href={`/hairstylists/${stylist.id}`}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-secondary overflow-hidden">
                    {stylist.bannerUrl ? (
                      <Image
                        src={normalizeImagePath(stylist.bannerUrl)}
                        alt={`${stylist.name} banner`}
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

                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                        {stylist.avatarUrl ? (
                          <Image
                            src={normalizeImagePath(stylist.avatarUrl)}
                            alt={stylist.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <Scissors className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {stylist.name}
                        </h3>
                        {stylist.specialties && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {stylist.specialties}
                          </p>
                        )}
                      </div>
                    </div>

                    {stylist.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {stylist.bio}
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

            <div className="mt-12 text-center bg-secondary rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-2">Are you a hairstylist?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Log in to manage your portfolio and profile.
              </p>
              <Link
                href="/hairstylists/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Hairstylist login
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
