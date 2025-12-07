import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Award, ExternalLink, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Sponsors() {
  const { data: sponsors = [] } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => base44.entities.Sponsor.list(),
    initialData: [],
  });

  const activeSponsors = sponsors.filter(s => s.active);

  const tierColors = {
    platinum: "bg-gray-300 text-gray-900",
    gold: "bg-yellow-400 text-yellow-900",
    silver: "bg-gray-400 text-gray-900",
    bronze: "bg-orange-600 text-white",
    community: "bg-[#22C55E] text-white",
  };

  const tierOrder = ["platinum", "gold", "silver", "bronze", "community"];
  const sponsorsByTier = tierOrder.reduce((acc, tier) => {
    acc[tier] = activeSponsors.filter(s => s.tier === tier);
    return acc;
  }, {});

  // Placeholder sponsors for carousel
  const placeholderSponsors = [
    "ACME Corp", "TechStart", "Green Solutions", "Austin Local", 
    "Community Bank", "Food Co-op", "Metro Transit", "Health Plus",
    "EduTech", "Solar Energy", "City Builders", "Fresh Foods"
  ];

  return (
    <div>
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .carousel-track {
          display: flex;
          width: fit-content;
          animation: scroll-left 30s linear infinite;
        }
        
        .carousel-container:hover .carousel-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* Hero Section */}
      <section className="bg-[#22C55E] py-20 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-black neo-brutal-border mx-auto mb-6 flex items-center justify-center">
            <Award className="w-10 h-10 text-[#22C55E]" />
          </div>
          <h1 className="text-6xl font-black mb-6 text-white">OUR SPONSORS</h1>
          <p className="text-2xl font-bold text-black max-w-3xl mx-auto">
            These amazing partners make our work possible
          </p>
        </div>
      </section>

      {/* Continuous Carousel */}
      <section className="bg-white py-12 neo-brutal-border border-b-4 overflow-hidden carousel-container">
        <div className="carousel-track">
          {/* Duplicate the array twice for seamless loop */}
          {[...placeholderSponsors, ...placeholderSponsors].map((sponsor, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 mx-6 w-48 h-32 bg-[#F5F5F5] neo-brutal-border neo-brutal-shadow flex items-center justify-center"
            >
              <div className="text-center p-4">
                <Building className="w-8 h-8 mx-auto mb-2 text-[#22C55E]" />
                <p className="font-black text-sm">{sponsor}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Thank You Message */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-black text-white neo-brutal-border neo-brutal-shadow p-8 text-center">
          <p className="text-2xl font-black max-w-3xl mx-auto">
            A heartfelt thank you to our sponsors who believe in our mission and 
            support our efforts to end homelessness in Austin.
          </p>
        </div>
      </section>

      {/* Sponsor Tiers */}
      <section className="container mx-auto px-4 py-16">
        {activeSponsors.length === 0 ? (
          <div className="bg-[#F5F5F5] neo-brutal-border neo-brutal-shadow p-12 text-center">
            <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="font-black text-xl mb-2">NO SPONSORS YET</p>
            <p className="font-bold text-gray-600">Become our first sponsor!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {tierOrder.map((tier) => {
              const tierSponsors = sponsorsByTier[tier];
              if (tierSponsors.length === 0) return null;

              return (
                <div key={tier}>
                  <div className="flex items-center gap-4 mb-6">
                    <Badge className={`${tierColors[tier]} neo-brutal-border text-xl px-6 py-3 font-black`}>
                      {tier.toUpperCase()} TIER
                    </Badge>
                    <div className="flex-1 h-1 bg-black"></div>
                  </div>

                  <div className={`grid gap-6 ${
                    tier === "platinum" ? "md:grid-cols-2" :
                    tier === "gold" ? "md:grid-cols-3" :
                    "md:grid-cols-4"
                  }`}>
                    {tierSponsors.map((sponsor) => (
                      <div
                        key={sponsor.id}
                        className="bg-white neo-brutal-border neo-brutal-shadow p-8"
                      >
                        <div className="aspect-video bg-[#F5F5F5] neo-brutal-border-thin mb-4 flex items-center justify-center">
                          {sponsor.logo_url ? (
                            <img
                              src={sponsor.logo_url}
                              alt={sponsor.company_name}
                              className="max-w-full max-h-full object-contain p-4"
                            />
                          ) : (
                            <Building className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                        <h3 className="text-xl font-black mb-2">{sponsor.company_name}</h3>
                        {sponsor.description && (
                          <p className="text-sm font-bold mb-4">{sponsor.description}</p>
                        )}
                        {sponsor.contribution_amount && (
                          <p className="text-sm font-bold text-[#22C55E] mb-4">
                            ${sponsor.contribution_amount.toLocaleString()} contributed
                          </p>
                        )}
                        {sponsor.website_url && (
                          <a
                            href={sponsor.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-black hover:text-[#22C55E]"
                          >
                            VISIT WEBSITE <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Become a Sponsor */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-[#22C55E] neo-brutal-border neo-brutal-shadow p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-black mb-6 text-white">BECOME A SPONSOR</h2>
            <p className="text-xl font-bold text-black mb-8">
              Join our mission and make a lasting impact on Austin's homeless community. 
              Partner with us to create real change.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white neo-brutal-border p-6">
                <h3 className="font-black text-2xl mb-2">PLATINUM</h3>
                <p className="text-3xl font-black text-[#22C55E] mb-2">$10K+</p>
                <p className="text-xs font-bold">Maximum visibility & impact</p>
              </div>
              <div className="bg-white neo-brutal-border p-6">
                <h3 className="font-black text-2xl mb-2">GOLD</h3>
                <p className="text-3xl font-black text-[#22C55E] mb-2">$5K+</p>
                <p className="text-xs font-bold">Premium partnership benefits</p>
              </div>
              <div className="bg-white neo-brutal-border p-6">
                <h3 className="font-black text-2xl mb-2">SILVER</h3>
                <p className="text-3xl font-black text-[#22C55E] mb-2">$2.5K+</p>
                <p className="text-xs font-bold">Strong community presence</p>
              </div>
            </div>
            <button className="neo-button bg-black text-white px-8 py-6 text-lg font-black">
              PARTNER WITH US
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
