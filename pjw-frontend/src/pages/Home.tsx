// import React from "react";
// import { base44 } from "@/api/base44Client";
// import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, Package, DollarSign, Target, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
// import { Progress } from "@/components/ui/progress";
import HeatmapSection from "../components/HeatmapSection";

export default function Home() {
  // const { data: donations = [] } = useQuery({
  //   queryKey: ["donations"],
  //   queryFn: () => base44.entities.Donation.list(),
  //   initialData: [],
  // });

  // const { data: volunteers = [] } = useQuery({
  //   queryKey: ["volunteers"],
  //   queryFn: () => base44.entities.Volunteer.list(),
  //   initialData: [],
  // });

  // const { data: deliveries = [] } = useQuery({
  //   queryKey: ["deliveries"],
  //   queryFn: () => base44.entities.Delivery.list(),
  //   initialData: [],
  // });

  // const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  // const totalMeals = deliveries.reduce((sum, d) => sum + (d.meals_delivered || 0), 0);
  const totalRaised = 10000
  const totalMeals = 40
  const goalAmount = 50000;
  const progressPercent = (totalRaised / goalAmount) * 100;

  const volunteers = [
    {"name": "Joe"}
  ]
  const donations = [
    {"donation": 10000}
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[#22C55E] py-20 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-black text-white px-4 py-2 neo-brutal-border mb-6">
                <span className="font-black text-sm">AUSTIN'S FIGHT AGAINST HOMELESSNESS</span>
              </div>
              <h1 className="text-6xl font-black mb-6 leading-tight text-white">
                ONE MEAL.<br />
                ONE PERSON.<br />
                ONE IMPACT.
              </h1>
              <p className="text-xl font-bold mb-8 text-black">
                Project Wampus delivers hope and hot meals to people experiencing homelessness across Austin, TX.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="neo-button text-lg px-8 py-6 font-black">
                  DONATE NOW
                </Button>
                <Button className="neo-button text-lg px-8 py-6 font-black">
                  VOLUNTEER
                </Button>
              </div>
            </div>
            <div className="bg-white neo-brutal-border neo-brutal-shadow p-8">
              <div className="aspect-square bg-[#F5F5F5] flex items-center justify-center neo-brutal-border">
                <div className="text-center">
                  <Package className="w-24 h-24 mx-auto mb-4 text-[#22C55E]" />
                  <p className="font-black text-2xl">HERO IMAGE</p>
                  <p className="text-sm text-gray-600">Team delivering meals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="bg-black text-white py-8 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-black text-[#22C55E] mb-2">${totalRaised.toLocaleString()}</div>
              <div className="text-sm font-bold">RAISED THIS YEAR</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-[#22C55E] mb-2">{totalMeals.toLocaleString()}</div>
              <div className="text-sm font-bold">MEALS DELIVERED</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-[#22C55E] mb-2">{volunteers.length}</div>
              <div className="text-sm font-bold">ACTIVE VOLUNTEERS</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-[#22C55E] mb-2">4</div>
              <div className="text-sm font-bold">YEARS SERVING</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Fundraising Tracker */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white neo-brutal-border neo-brutal-shadow p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black">LIVE FUNDRAISING TRACKER</h2>
              <p className="text-sm font-bold">Goal: $50,000 for 2024 Operations</p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-black text-2xl text-[#22C55E]">${totalRaised.toLocaleString()}</span>
              <span className="font-black text-2xl">${goalAmount.toLocaleString()}</span>
            </div>
            <div className="h-12 bg-[#F5F5F5] neo-brutal-border relative overflow-hidden">
              <div
                className="h-full bg-[#22C55E] transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-black text-black text-xl">{progressPercent.toFixed(1)}% FUNDED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#F5F5F5] neo-brutal-border p-4">
              <DollarSign className="w-8 h-8 mb-2 text-[#22C55E]" />
              <p className="font-black text-lg">${(goalAmount - totalRaised).toLocaleString()}</p>
              <p className="text-xs font-bold">LEFT TO RAISE</p>
            </div>
            <div className="bg-[#F5F5F5] neo-brutal-border p-4">
              <Heart className="w-8 h-8 mb-2 text-[#22C55E]" />
              <p className="font-black text-lg">{donations.length}</p>
              <p className="text-xs font-bold">TOTAL DONORS</p>
            </div>
            <div className="bg-[#F5F5F5] neo-brutal-border p-4">
              <TrendingUp className="w-8 h-8 mb-2 text-[#22C55E]" />
              <p className="font-black text-lg">↑ 23%</p>
              <p className="text-xs font-bold">VS LAST MONTH</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-black text-white py-16 neo-brutal-border border-y-4">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-6">OUR MISSION</h2>
          <p className="text-xl font-bold max-w-3xl mx-auto leading-relaxed">
            Project Wampus exists to combat homelessness in Austin through direct action: 
            delivering nutritious meals, advocating for policy change, and building community 
            partnerships that create lasting impact.
          </p>
        </div>
      </section>

      {/* Heatmap Section */}
      <section id="heatmap" className="container mx-auto px-4 py-16 scroll-mt-20">
        <HeatmapSection />
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-[#22C55E] neo-brutal-border neo-brutal-shadow p-12 text-center">
          <h2 className="text-5xl font-black mb-6 text-white">JOIN THE MOVEMENT</h2>
          <p className="text-xl font-bold mb-8 text-black">
            Every dollar, every volunteer hour, every meal makes a difference.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="neo-button bg-black! text-white text-lg px-8 py-6 font-black">
              <Users className="w-5 h-5 mr-2" />
              BECOME A VOLUNTEER
            </Button>
            <Button className="neo-button bg-white text-black text-lg px-8 py-6 font-black">
              <Heart className="w-5 h-5 mr-2" />
              MAKE A DONATION
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
