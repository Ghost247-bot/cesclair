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
    <div className="min-h-screen bg-white pt-[60px] md:pt-[64px]">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80"
          alt="Our Hairstylists"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light mb-6 tracking-wide">
            Our Hairstylists
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-white/95 max-w-2xl mx-auto font-light italic leading-relaxed">
            Discover talented artists who transform hair into art
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto py-20 px-4">
        {approved.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scissors className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-4">
              No Hairstylists Yet
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto font-serif">
              Check back soon to discover our talented hairstylist portfolios
            </p>
            <Link
              href="/hairstylists/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-serif tracking-wide"
            >
              Hairstylist Login
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-4">
                Featured Hairstylists
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-serif italic">
                Explore portfolios and connect with our talented artists
              </p>
            </div>

            {/* Hairstylist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {approved.map((stylist) => (
                <Link
                  key={stylist.id}
                  href={`/hairstylists/${stylist.id}`}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Banner Image */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    {stylist.bannerUrl ? (
                      <Image
                        src={normalizeImagePath(stylist.bannerUrl)}
                        alt={`${stylist.name} portfolio`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase className="w-20 h-20 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Profile Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg flex-shrink-0">
                        {stylist.avatarUrl ? (
                          <Image
                            src={normalizeImagePath(stylist.avatarUrl)}
                            alt={stylist.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Scissors className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-serif font-light text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {stylist.name}
                        </h3>
                        {stylist.specialties && (
                          <p className="text-gray-600 font-serif italic line-clamp-2">
                            {stylist.specialties}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {stylist.bio && (
                      <p className="text-gray-700 leading-relaxed mb-6 font-serif italic line-clamp-3">
                        "{stylist.bio}"
                      </p>
                    )}

                    {/* Call to Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-900 font-serif group-hover:text-gray-700 transition-colors">
                        <span className="text-sm tracking-wide">View Portfolio</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Call to Action Section */}
            <div className="mt-20 text-center bg-gray-50 rounded-2xl p-12 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-4">
                Are You a Hairstylist?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-serif italic">
                Join our community and showcase your artistic talent
              </p>
              <Link
                href="/hairstylists/login"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-serif tracking-wide"
              >
                Hairstylist Login
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
