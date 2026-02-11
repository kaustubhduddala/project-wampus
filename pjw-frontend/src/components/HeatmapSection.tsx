
// import React from "react";
import { MapPin, Target } from "lucide-react";

export default function HeatmapSection() {
  // Placeholder Austin coordinates
  const deliveryLocations = [
    { lat: 30.2672, lng: -97.7431, meals: 45 },
    { lat: 30.2500, lng: -97.7500, meals: 32 },
    { lat: 30.2800, lng: -97.7200, meals: 58 },
    { lat: 30.2400, lng: -97.7600, meals: 41 },
  ];

  return (
    <div className="bg-[#F5F5F5] p-8 neo-brutal-border neo-brutal-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black">IMPACT HEATMAP</h2>
          <p className="text-sm font-bold">Our delivery zones across Austin</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Placeholder Map */}
        <div className="bg-white neo-brutal-border neo-brutal-shadow-sm p-8 flex items-center justify-center min-h-100">
          <div className="text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-[#22C55E]" />
            <p className="font-black text-xl mb-2">INTERACTIVE MAP</p>
            <p className="text-sm text-gray-600">
              Heatmap visualization showing homeless resource centers,<br />
              reported concentrations, and PJW delivery locations
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-red-500 neo-brutal-border-thin"></div>
                <span className="text-xs font-bold">High Need Areas</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-[#22C55E] neo-brutal-border-thin"></div>
                <span className="text-xs font-bold">PJW Delivery Zones</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-blue-500 neo-brutal-border-thin"></div>
                <span className="text-xs font-bold">Resource Centers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">
          <div className="bg-white neo-brutal-border neo-brutal-shadow-sm p-6">
            <h3 className="font-black text-xl mb-4">DELIVERY HOTSPOTS</h3>
            <div className="space-y-3">
              {deliveryLocations.map((location, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#F5F5F5] neo-brutal-border-thin">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#22C55E]" />
                    <span className="font-bold text-sm">Zone {idx + 1}</span>
                  </div>
                  <span className="font-black text-[#22C55E]">{location.meals} meals</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black text-white neo-brutal-border neo-brutal-shadow-sm p-6">
            <h3 className="font-black text-xl mb-2">NEXT TARGET AREAS</h3>
            <p className="text-sm mb-4">AI-predicted high-priority zones for outreach</p>
            <div className="space-y-2">
              <div className="p-3 bg-white text-black neo-brutal-border-thin">
                <p className="font-bold text-sm">Downtown East: Priority Score 8.7</p>
              </div>
              <div className="p-3 bg-white text-black neo-brutal-border-thin">
                <p className="font-bold text-sm">South Congress: Priority Score 7.9</p>
              </div>
              <div className="p-3 bg-white text-black neo-brutal-border-thin">
                <p className="font-bold text-sm">North Lamar: Priority Score 7.2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

