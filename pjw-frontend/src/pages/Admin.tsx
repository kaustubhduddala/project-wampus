import React, { useState } from "react";
import {
  Users, Star, Map, TrendingUp, FileText, Crown, Image,
  RefreshCw, Package, BookOpen, Trash2, Plus, Check, X,
  AlertTriangle, ChevronRight, Shield, ExternalLink, Upload,
  Edit2, Save, ArrowUp, BarChart2, MapPin, Calendar
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminSection =
  | "users"
  | "sponsors"
  | "heatmap"
  | "heatmap-insights"
  | "legislative"
  | "leadership"
  | "team-photo"
  | "chatbot"
  | "deliveries"
  | "journey";

interface Volunteer {
  id: string;
  name: string;
  email: string;
  role: "volunteer" | "admin";
  joinedDate: string;
  deliveries: number;
}

interface Sponsor {
  id: string;
  name: string;
  imageUrl: string;
  companyUrl: string;
  tier: "platinum" | "gold" | "silver" | "bronze" | "community";
  contributionAmount: number;
  description: string;
}

interface HeatmapPoint {
  id: string;
  latitude: string;
  longitude: string;
  notes: string;
  date: string;
}

interface LegislativeUpdate {
  id: string;
  title: string;
  content: string;
  billNumber: string;
  status: "proposed" | "in-committee" | "passed" | "defeated" | "signed";
  impact: "positive" | "negative" | "neutral";
  actionTaken: string;
  linkUrl: string;
  priority: "high" | "medium" | "low";
}

interface LeadershipMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  imageUrl: string;
}

interface JourneyEntry {
  id: string;
  year: string;
  title: string;
  description: string;
}

interface DeliveryLog {
  id: string;
  volunteerName: string;
  address: string;
  date: string;
  notes: string;
  status: "approved" | "pending";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockVolunteers: Volunteer[] = [
  { id: "1", name: "Alex Rivera", email: "alex@utexas.edu", role: "admin", joinedDate: "2023-01-15", deliveries: 142 },
  { id: "2", name: "Sam Patel", email: "sam@utexas.edu", role: "volunteer", joinedDate: "2023-04-22", deliveries: 87 },
  { id: "3", name: "Jordan Lee", email: "jlee@utexas.edu", role: "volunteer", joinedDate: "2023-08-10", deliveries: 55 },
  { id: "4", name: "Morgan Chen", email: "mchen@utexas.edu", role: "volunteer", joinedDate: "2024-01-05", deliveries: 23 },
  { id: "5", name: "Taylor Brooks", email: "tbrooks@utexas.edu", role: "volunteer", joinedDate: "2024-03-18", deliveries: 9 },
];

const mockSponsors: Sponsor[] = [
  { id: "1", name: "Austin Tech Co.", imageUrl: "", companyUrl: "https://example.com", tier: "platinum", contributionAmount: 10000, description: "Leading technology company supporting our mission." },
  { id: "2", name: "Lone Star Foods", imageUrl: "", companyUrl: "https://example.com", tier: "gold", contributionAmount: 5000, description: "Local food supplier providing discounted ingredients." },
];

const mockHeatmapPoints: HeatmapPoint[] = [
  { id: "1", latitude: "30.2849", longitude: "-97.7341", notes: "High-density area near downtown shelter", date: "2024-03-10" },
  { id: "2", latitude: "30.2672", longitude: "-97.7431", notes: "Riverside park regular meetup point", date: "2024-03-15" },
];

const mockLegislative: LegislativeUpdate[] = [
  { id: "1", title: "Austin Housing First Act", content: "Legislation prioritizing permanent housing solutions for homeless individuals.", billNumber: "HB 2341", status: "proposed", impact: "positive", actionTaken: "Submitted public comment in support", linkUrl: "https://example.com", priority: "high" },
  { id: "2", title: "Camping Ban Amendment", content: "Proposed amendment to restrict outdoor camping in public spaces.", billNumber: "SB 987", status: "in-committee", impact: "negative", actionTaken: "Organized community response, attended hearings", linkUrl: "https://example.com", priority: "high" },
];

const mockLeadership: LeadershipMember[] = [
  { id: "1", name: "Maya Johnson", position: "President", bio: "Computer Science senior passionate about community service.", imageUrl: "" },
  { id: "2", name: "Ethan Wu", position: "VP of Operations", bio: "Public Policy junior focused on systemic solutions.", imageUrl: "" },
  { id: "3", name: "Priya Sharma", position: "Community Outreach Lead", bio: "Social Work sophomore bridging volunteer and community.", imageUrl: "" },
];

const mockJourney: JourneyEntry[] = [
  { id: "1", year: "2021", title: "Project Wampus Founded", description: "Started with 5 students and a vision to address homelessness in Austin." },
  { id: "2", year: "2022", title: "First 1,000 Meals", description: "Reached our first major milestone of 1,000 meals delivered." },
  { id: "3", year: "2023", title: "Partnership Program Launch", description: "Began working with local businesses and shelters for greater impact." },
  { id: "4", year: "2024", title: "50,000+ Meals Delivered", description: "Expanded to 100+ active volunteers across the Austin area." },
];

const mockDeliveries: DeliveryLog[] = [
  { id: "1", volunteerName: "Alex Rivera", address: "123 Congress Ave", date: "2024-03-20", notes: "15 meals to Sunrise Shelter", status: "approved" },
  { id: "2", volunteerName: "Jordan Lee", address: "456 Riverside Dr", date: "2024-03-21", notes: "10 meals, person in need under bridge", status: "approved" },
  { id: "3", volunteerName: "Sam Patel", address: "789 Lamar Blvd", date: "2024-03-22", notes: "8 meals delivered, all received", status: "pending" },
  { id: "4", volunteerName: "Morgan Chen", address: "321 6th St", date: "2024-03-22", notes: "Unconfirmed delivery — needs review", status: "pending" },
];

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

const navItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: "users", label: "User Management", icon: Users },
  { id: "sponsors", label: "Sponsors", icon: Star },
  { id: "heatmap", label: "Heatmap Points", icon: Map },
  { id: "heatmap-insights", label: "Heatmap Insights", icon: BarChart2 },
  { id: "legislative", label: "Legislative Updates", icon: FileText },
  { id: "leadership", label: "Leadership Team", icon: Crown },
  { id: "team-photo", label: "Team Photo", icon: Image },
  { id: "chatbot", label: "Chatbot Refresh", icon: RefreshCw },
  { id: "deliveries", label: "Delivery Logs", icon: Package },
  { id: "journey", label: "Journey / Timeline", icon: BookOpen },
];

// ─── Tier Badge ───────────────────────────────────────────────────────────────

const tierColors: Record<string, string> = {
  platinum: "bg-gray-200 text-gray-900",
  gold: "bg-yellow-400 text-black",
  silver: "bg-gray-400 text-white",
  bronze: "bg-orange-700 text-white",
  community: "bg-[#22C55E] text-white",
};

// ─── Section: User Management ─────────────────────────────────────────────────

function UsersSection() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);

  const deleteVolunteer = (id: string) => {
    setVolunteers((prev) => prev.filter((v) => v.id !== id));
  };

  const toggleRole = (id: string) => {
    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, role: v.role === "admin" ? "volunteer" : "admin" } : v
      )
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
          <Users className="w-6 h-6 text-black" />
        </div>
        <div>
          <h2 className="text-3xl font-black">USER MANAGEMENT</h2>
          <p className="font-bold text-gray-600">{volunteers.length} active volunteers</p>
        </div>
      </div>

      <div className="space-y-3">
        {volunteers.map((volunteer) => (
          <div
            key={volunteer.id}
            className="bg-white neo-brutal-border neo-brutal-shadow p-4 flex items-center gap-4"
          >
            {/* Avatar */}
            <div className="w-12 h-12 bg-[#F5F5F5] neo-brutal-border flex items-center justify-center flex-shrink-0">
              <span className="font-black text-lg">{volunteer.name.charAt(0)}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black">{volunteer.name}</span>
                {volunteer.role === "admin" && (
                  <span className="bg-[#22C55E] text-black px-2 py-0.5 neo-brutal-border text-xs font-black">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-gray-600">{volunteer.email}</p>
              <p className="text-xs font-bold text-gray-500">
                Joined {volunteer.joinedDate} · {volunteer.deliveries} deliveries
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleRole(volunteer.id)}
                className={`neo-button px-3 py-2 text-xs font-black flex items-center gap-1 ${
                  volunteer.role === "admin"
                    ? "bg-white text-black"
                    : "bg-[#22C55E] text-black"
                }`}
                title={volunteer.role === "admin" ? "Remove admin" : "Promote to admin"}
              >
                <Shield className="w-3 h-3" />
                {volunteer.role === "admin" ? "DEMOTE" : "PROMOTE"}
              </button>
              <button
                onClick={() => deleteVolunteer(volunteer.id)}
                className="neo-button bg-red-500 text-white px-3 py-2 text-xs font-black flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                DELETE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Sponsors ────────────────────────────────────────────────────────

function SponsorsSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>(mockSponsors);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const blank: Omit<Sponsor, "id"> = {
    name: "", imageUrl: "", companyUrl: "", tier: "community", contributionAmount: 0, description: "",
  };
  const [form, setForm] = useState<Omit<Sponsor, "id">>(blank);

  const startEdit = (s: Sponsor) => {
    setEditing(s.id);
    setForm({ name: s.name, imageUrl: s.imageUrl, companyUrl: s.companyUrl, tier: s.tier, contributionAmount: s.contributionAmount, description: s.description });
    setShowAdd(false);
  };

  const saveEdit = (id: string) => {
    setSponsors((prev) => prev.map((s) => (s.id === id ? { ...s, ...form } : s)));
    setEditing(null);
  };

  const deleteSponsor = (id: string) => setSponsors((prev) => prev.filter((s) => s.id !== id));

  const addSponsor = () => {
    setSponsors((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    setForm(blank);
    setShowAdd(false);
  };

  const SponsorForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-black text-sm mb-1">COMPANY NAME *</label>
          <Input className="neo-brutal-border-thin font-bold" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Austin Tech Co." />
        </div>
        <div>
          <label className="block font-black text-sm mb-1">COMPANY URL *</label>
          <Input className="neo-brutal-border-thin font-bold" value={form.companyUrl} onChange={(e) => setForm({ ...form, companyUrl: e.target.value })} placeholder="https://company.com" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-black text-sm mb-1">TIER *</label>
          <select className="w-full h-10 neo-brutal-border-thin font-bold px-3 bg-white" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value as Sponsor["tier"] })}>
            {["platinum", "gold", "silver", "bronze", "community"].map((t) => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-black text-sm mb-1">CONTRIBUTION AMOUNT ($) *</label>
          <Input type="number" className="neo-brutal-border-thin font-bold" value={form.contributionAmount} onChange={(e) => setForm({ ...form, contributionAmount: Number(e.target.value) })} placeholder="5000" />
        </div>
      </div>
      <div>
        <label className="block font-black text-sm mb-1">IMAGE URL</label>
        <Input className="neo-brutal-border-thin font-bold" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
      </div>
      <div>
        <label className="block font-black text-sm mb-1">COMPANY DESCRIPTION *</label>
        <Textarea className="neo-brutal-border-thin font-bold" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the company and their support..." rows={3} />
      </div>
      <div className="flex gap-3">
        <button onClick={onSave} className="neo-button bg-[#22C55E] text-black px-5 py-2 font-black flex items-center gap-2">
          <Save className="w-4 h-4" /> SAVE
        </button>
        <button onClick={onCancel} className="neo-button bg-white text-black px-5 py-2 font-black flex items-center gap-2">
          <X className="w-4 h-4" /> CANCEL
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
            <Star className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-black">SPONSORS</h2>
            <p className="font-bold text-gray-600">{sponsors.length} sponsors</p>
          </div>
        </div>
        {!showAdd && (
          <button onClick={() => { setShowAdd(true); setEditing(null); setForm(blank); }} className="neo-button bg-[#22C55E] text-black px-4 py-2 font-black flex items-center gap-2">
            <Plus className="w-4 h-4" /> ADD SPONSOR
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white neo-brutal-border neo-brutal-shadow p-6 mb-6">
          <h3 className="font-black text-xl mb-4">NEW SPONSOR</h3>
          <SponsorForm onSave={addSponsor} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      <div className="space-y-4">
        {sponsors.map((sponsor) => (
          <div key={sponsor.id} className="bg-white neo-brutal-border neo-brutal-shadow p-6">
            {editing === sponsor.id ? (
              <>
                <h3 className="font-black text-lg mb-4">EDITING: {sponsor.name}</h3>
                <SponsorForm onSave={() => saveEdit(sponsor.id)} onCancel={() => setEditing(null)} />
              </>
            ) : (
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#F5F5F5] neo-brutal-border flex items-center justify-center flex-shrink-0">
                  {sponsor.imageUrl ? (
                    <img src={sponsor.imageUrl} alt={sponsor.name} className="w-full h-full object-contain" />
                  ) : (
                    <Star className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-black text-lg">{sponsor.name}</span>
                    <span className={`px-2 py-0.5 text-xs font-black neo-brutal-border ${tierColors[sponsor.tier]}`}>
                      {sponsor.tier.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-600 mb-1">{sponsor.description}</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                    <span>${sponsor.contributionAmount.toLocaleString()}</span>
                    <a href={sponsor.companyUrl} className="flex items-center gap-1 text-[#22C55E] hover:underline">
                      <ExternalLink className="w-3 h-3" /> Website
                    </a>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(sponsor)} className="neo-button bg-white px-3 py-2 text-xs font-black flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> EDIT
                  </button>
                  <button onClick={() => deleteSponsor(sponsor.id)} className="neo-button bg-red-500 text-white px-3 py-2 text-xs font-black flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> DELETE
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Heatmap Points ──────────────────────────────────────────────────

function HeatmapSection() {
  const [points, setPoints] = useState<HeatmapPoint[]>(mockHeatmapPoints);
  const [showAdd, setShowAdd] = useState(false);
  const blank = { latitude: "", longitude: "", notes: "", date: new Date().toISOString().slice(0, 10) };
  const [form, setForm] = useState(blank);

  const addPoint = () => {
    setPoints((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    setForm(blank);
    setShowAdd(false);
  };

  const deletePoint = (id: string) => setPoints((prev) => prev.filter((p) => p.id !== id));

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
            <Map className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-black">HEATMAP POINTS</h2>
            <p className="font-bold text-gray-600">{points.length} data points</p>
          </div>
        </div>
        {!showAdd && (
          <button onClick={() => setShowAdd(true)} className="neo-button bg-[#22C55E] text-black px-4 py-2 font-black flex items-center gap-2">
            <Plus className="w-4 h-4" /> ADD POINT
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white neo-brutal-border neo-brutal-shadow p-6 mb-6">
          <h3 className="font-black text-xl mb-4">NEW HEATMAP POINT</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-black text-sm mb-1">LATITUDE *</label>
              <Input className="neo-brutal-border-thin font-bold" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="30.2849" />
            </div>
            <div>
              <label className="block font-black text-sm mb-1">LONGITUDE *</label>
              <Input className="neo-brutal-border-thin font-bold" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="-97.7341" />
            </div>
          </div>
          <div className="mb-4">
            <button onClick={getLocation} className="neo-button bg-white text-black px-4 py-2 text-sm font-black flex items-center gap-2">
              <MapPin className="w-4 h-4" /> USE MY CURRENT LOCATION
            </button>
          </div>
          <div className="mb-4">
            <label className="block font-black text-sm mb-1">DATE</label>
            <Input type="date" className="neo-brutal-border-thin font-bold" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="mb-4">
            <label className="block font-black text-sm mb-1">NOTES</label>
            <Textarea className="neo-brutal-border-thin font-bold" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Describe this location..." rows={3} />
          </div>
          <div className="flex gap-3">
            <button onClick={addPoint} className="neo-button bg-[#22C55E] text-black px-5 py-2 font-black flex items-center gap-2">
              <Save className="w-4 h-4" /> SAVE POINT
            </button>
            <button onClick={() => setShowAdd(false)} className="neo-button bg-white text-black px-5 py-2 font-black flex items-center gap-2">
              <X className="w-4 h-4" /> CANCEL
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {points.map((point) => (
          <div key={point.id} className="bg-white neo-brutal-border neo-brutal-shadow p-4 flex items-start gap-4">
            <div className="w-10 h-10 bg-[#22C55E] neo-brutal-border flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-black" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm">{point.latitude}, {point.longitude}</p>
              <p className="font-bold text-sm text-gray-600">{point.notes || "No notes"}</p>
              <p className="text-xs font-bold text-gray-500">{point.date}</p>
            </div>
            <button onClick={() => deletePoint(point.id)} className="neo-button bg-red-500 text-white px-3 py-2 text-xs font-black flex items-center gap-1 flex-shrink-0">
              <Trash2 className="w-3 h-3" /> DELETE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Heatmap Insights (ML) ──────────────────────────────────────────

function HeatmapInsightsSection() {
  const insights = [
    { label: "High-density cluster", value: "E. 6th St corridor", change: "+12% this month" },
    { label: "Emerging hotspot", value: "Rundberg Ln area", change: "New since Feb 2024" },
    { label: "Coverage gap", value: "East Austin (78702)", change: "No deliveries in 14 days" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
          <BarChart2 className="w-6 h-6 text-black" />
        </div>
        <div>
          <h2 className="text-3xl font-black">HEATMAP INSIGHTS</h2>
          <p className="font-bold text-gray-600">ML-powered pattern analysis</p>
        </div>
      </div>

      <div className="bg-black text-white neo-brutal-border neo-brutal-shadow p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-[#22C55E]" />
          <span className="font-black text-lg">ML MODEL STATUS</span>
          <span className="bg-[#22C55E] text-black px-2 py-0.5 text-xs font-black neo-brutal-border">ACTIVE</span>
        </div>
        <p className="font-bold text-gray-300 text-sm">
          Last analysis run: March 22, 2024 · Next scheduled: March 29, 2024
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {insights.map((insight, i) => (
          <div key={i} className="bg-white neo-brutal-border neo-brutal-shadow p-5">
            <p className="text-xs font-black text-gray-500 uppercase mb-2">{insight.label}</p>
            <p className="font-black text-lg mb-1">{insight.value}</p>
            <p className="text-sm font-bold text-[#22C55E]">{insight.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#F5F5F5] neo-brutal-border p-6 mb-6">
        <h3 className="font-black text-xl mb-4">RESOURCE ALLOCATION SUGGESTIONS</h3>
        <div className="space-y-3">
          {[
            { priority: "HIGH", text: "Increase delivery frequency to E. 6th St area — 3 consecutive high-need days detected.", color: "bg-red-500" },
            { priority: "MEDIUM", text: "Coordinate with Sunrise Shelter for overflow needs this weekend.", color: "bg-yellow-400" },
            { priority: "LOW", text: "Consider adding a Saturday route to Rundberg Ln based on emerging pattern.", color: "bg-[#22C55E]" },
          ].map((item, i) => (
            <div key={i} className="bg-white neo-brutal-border p-4 flex items-start gap-3">
              <span className={`${item.color} text-black px-2 py-0.5 text-xs font-black neo-brutal-border flex-shrink-0`}>{item.priority}</span>
              <p className="font-bold text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white neo-brutal-border neo-brutal-shadow p-6">
        <h3 className="font-black text-xl mb-2">MODEL CONFIGURATION</h3>
        <p className="font-bold text-gray-600 text-sm mb-4">Adjust parameters for the ML analysis pipeline.</p>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-black text-sm mb-1">CLUSTER RADIUS (meters)</label>
            <Input className="neo-brutal-border-thin font-bold" defaultValue="500" type="number" />
          </div>
          <div>
            <label className="block font-black text-sm mb-1">MINIMUM DENSITY THRESHOLD</label>
            <Input className="neo-brutal-border-thin font-bold" defaultValue="3" type="number" />
          </div>
        </div>
        <button className="neo-button bg-[#22C55E] text-black px-5 py-2 font-black flex items-center gap-2">
          <Save className="w-4 h-4" /> SAVE CONFIGURATION
        </button>
      </div>
    </div>
  );
}

// ─── Section: Legislative Updates ─────────────────────────────────────────────

function LegislativeSection() {
  const [updates, setUpdates] = useState<LegislativeUpdate[]>(mockLegislative);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const blank: Omit<LegislativeUpdate, "id"> = {
    title: "", content: "", billNumber: "", status: "proposed", impact: "neutral", actionTaken: "", linkUrl: "", priority: "medium",
  };
  const [form, setForm] = useState<Omit<LegislativeUpdate, "id">>(blank);

  const startEdit = (u: LegislativeUpdate) => {
    setEditing(u.id);
    setForm({ title: u.title, content: u.content, billNumber: u.billNumber, status: u.status, impact: u.impact, actionTaken: u.actionTaken, linkUrl: u.linkUrl, priority: u.priority });
    setShowAdd(false);
  };

  const saveEdit = (id: string) => {
    setUpdates((prev) => prev.map((u) => (u.id === id ? { ...u, ...form } : u)));
    setEditing(null);
  };

  const deleteUpdate = (id: string) => setUpdates((prev) => prev.filter((u) => u.id !== id));

  const addUpdate = () => {
    setUpdates((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    setForm(blank);
    setShowAdd(false);
  };

  const impactColors: Record<string, string> = {
    positive: "bg-[#22C55E] text-black",
    negative: "bg-red-500 text-white",
    neutral: "bg-gray-400 text-white",
  };

  const priorityColors: Record<string, string> = {
    high: "bg-red-500 text-white",
    medium: "bg-yellow-400 text-black",
    low: "bg-gray-300 text-black",
  };

  const LegForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-black text-sm mb-1">TITLE *</label>
          <Input className="neo-brutal-border-thin font-bold" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Austin Housing First Act" />
        </div>
        <div>
          <label className="block font-black text-sm mb-1">BILL NUMBER *</label>
          <Input className="neo-brutal-border-thin font-bold" value={form.billNumber} onChange={(e) => setForm({ ...form, billNumber: e.target.value })} placeholder="HB 2341" />
        </div>
      </div>
      <div>
        <label className="block font-black text-sm mb-1">CONTENT / DESCRIPTION *</label>
        <Textarea className="neo-brutal-border-thin font-bold" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Describe the bill..." rows={3} />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block font-black text-sm mb-1">STATUS *</label>
          <select className="w-full h-10 neo-brutal-border-thin font-bold px-3 bg-white" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LegislativeUpdate["status"] })}>
            {["proposed", "in-committee", "passed", "defeated", "signed"].map((s) => (
              <option key={s} value={s}>{s.replace("-", " ").toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-black text-sm mb-1">IMPACT *</label>
          <select className="w-full h-10 neo-brutal-border-thin font-bold px-3 bg-white" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value as LegislativeUpdate["impact"] })}>
            {["positive", "negative", "neutral"].map((i) => (
              <option key={i} value={i}>{i.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-black text-sm mb-1">PRIORITY *</label>
          <select className="w-full h-10 neo-brutal-border-thin font-bold px-3 bg-white" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as LegislativeUpdate["priority"] })}>
            {["high", "medium", "low"].map((p) => (
              <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block font-black text-sm mb-1">ACTION TAKEN / WILL TAKE</label>
        <Textarea className="neo-brutal-border-thin font-bold" value={form.actionTaken} onChange={(e) => setForm({ ...form, actionTaken: e.target.value })} placeholder="What has been or will be done..." rows={2} />
      </div>
      <div>
        <label className="block font-black text-sm mb-1">LINK TO BILL OR ACTIVISM</label>
        <Input className="neo-brutal-border-thin font-bold" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." />
      </div>
      <div className="flex gap-3">
        <button onClick={onSave} className="neo-button bg-[#22C55E] text-black px-5 py-2 font-black flex items-center gap-2">
          <Save className="w-4 h-4" /> SAVE
        </button>
        <button onClick={onCancel} className="neo-button bg-white text-black px-5 py-2 font-black flex items-center gap-2">
          <X className="w-4 h-4" /> CANCEL
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
            <FileText className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-black">LEGISLATIVE UPDATES</h2>
            <p className="font-bold text-gray-600">{updates.length} updates</p>
          </div>
        </div>
        {!showAdd && (
          <button onClick={() => { setShowAdd(true); setEditing(null); setForm(blank); }} className="neo-button bg-[#22C55E] text-black px-4 py-2 font-black flex items-center gap-2">
            <Plus className="w-4 h-4" /> ADD UPDATE
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white neo-brutal-border neo-brutal-shadow p-6 mb-6">
          <h3 className="font-black text-xl mb-4">NEW LEGISLATIVE UPDATE</h3>
          <LegForm onSave={addUpdate} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="bg-white neo-brutal-border neo-brutal-shadow p-6">
            {editing === update.id ? (
              <>
                <h3 className="font-black text-lg mb-4">EDITING: {update.title}</h3>
                <LegForm onSave={() => saveEdit(update.id)} onCancel={() => setEditing(null)} />
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-black text-lg">{update.title}</span>
                      <span className="bg-black text-white px-2 py-0.5 text-xs font-black neo-brutal-border">{update.billNumber}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-2">
                      <span className={`px-2 py-0.5 text-xs font-black neo-brutal-border ${impactColors[update.impact]}`}>{update.impact.toUpperCase()}</span>
                      <span className={`px-2 py-0.5 text-xs font-black neo-brutal-border ${priorityColors[update.priority]}`}>{update.priority.toUpperCase()} PRIORITY</span>
                      <span className="bg-[#F5F5F5] px-2 py-0.5 text-xs font-black neo-brutal-border">{update.status.replace("-", " ").toUpperCase()}</span>
                    </div>
                    <p className="font-bold text-sm text-gray-600 mb-2">{update.content}</p>
                    {update.actionTaken && <p className="text-xs font-bold text-gray-500"><span className="text-black">Action:</span> {update.actionTaken}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(update)} className="neo-button bg-white px-3 py-2 text-xs font-black flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> EDIT
                    </button>
                    <button onClick={() => deleteUpdate(update.id)} className="neo-button bg-red-500 text-white px-3 py-2 text-xs font-black flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> DELETE
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Leadership Team ─────────────────────────────────────────────────

function LeadershipSection() {
  const [members, setMembers] = useState<LeadershipMember[]>(mockLeadership);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const blank: Omit<LeadershipMember, "id"> = { name: "", position: "", bio: "", imageUrl: "" };
  const [form, setForm] = useState<Omit<LeadershipMember, "id">>(blank);

  const startEdit = (m: LeadershipMember) => {
    setEditing(m.id);
    setForm({ name: m.name, position: m.position, bio: m.bio, imageUrl: m.imageUrl });
    setShowAdd(false);
  };

  const saveEdit = (id: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...form } : m)));
    setEditing(null);
  };

  const deleteMember = (id: string) => setMembers((prev) => prev.filter((m) => m.id !== id));

  const addMember = () => {
    setMembers((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    setForm(blank);
    setShowAdd(false);
  };

  const MemberForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-black text-sm mb-1">NAME *</label>
          <Input className="neo-brutal-border-thin font-bold" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Maya Johnson" />
        </div>
        <div>
          <label className="block font-black text-sm mb-1">POSITION *</label>
          <Input className="neo-brutal-border-thin font-bold" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="President" />
        </div>
      </div>
      <div>
        <label className="block font-black text-sm mb-1">IMAGE URL</label>
        <Input className="neo-brutal-border-thin font-bold" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
      </div>
      <div>
        <label className="block font-black text-sm mb-1">BIO *</label>
        <Textarea className="neo-brutal-border-thin font-bold" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Brief biography..." rows={3} />
      </div>
      <div className="flex gap-3">
        <button onClick={onSave} className="neo-button bg-[#22C55E] text-black px-5 py-2 font-black flex items-center gap-2">
          <Save className="w-4 h-4" /> SAVE
        </button>
        <button onClick={onCancel} className="neo-button bg-white text-black px-5 py-2 font-black flex items-center gap-2">
          <X className="w-4 h-4" /> CANCEL
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-black">LEADERSHIP TEAM</h2>
            <p className="font-bold text-gray-600">{members.length} positions</p>
          </div>
        </div>
        {!showAdd && (
          <button onClick={() => { setShowAdd(true); setEditing(null); setForm(blank); }} className="neo-button bg-[#22C55E] text-black px-4 py-2 font-black flex items-center gap-2">
            <Plus className="w-4 h-4" /> ADD POSITION
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white neo-brutal-border neo-brutal-shadow p-6 mb-6">
          <h3 className="font-black text-xl mb-4">NEW LEADERSHIP POSITION</h3>
          <MemberForm onSave={addMember} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {members.map((member) => (
          <div key={member.id} className="bg-white neo-brutal-border neo-brutal-shadow p-5">
            {editing === member.id ? (
              <>
                <h3 className="font-black text-base mb-4">EDITING: {member.name}</h3>
                <MemberForm onSave={() => saveEdit(member.id)} onCancel={() => setEditing(null)} />
              </>
            ) : (
              <>
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-14 h-14 bg-[#F5F5F5] neo-brutal-border flex items-center justify-center flex-shrink-0">
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-xl">{member.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-black">{member.name}</p>
                    <span className="bg-black text-white px-2 py-0.5 text-xs font-black neo-brutal-border inline-block mb-1">{member.position}</span>
                    <p className="text-sm font-bold text-gray-600">{member.bio}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(member)} className="neo-button bg-white px-3 py-2 text-xs font-black flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> EDIT
                  </button>
                  <button onClick={() => deleteMember(member.id)} className="neo-button bg-red-500 text-white px-3 py-2 text-xs font-black flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> DELETE
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Team Photo ──────────────────────────────────────────────────────

function TeamPhotoSection() {
  const [photoUrl, setPhotoUrl] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
          <Image className="w-6 h-6 text-black" />
        </div>
        <div>
          <h2 className="text-3xl font-black">TEAM PHOTO</h2>
          <p className="font-bold text-gray-600">Update the organization team photo</p>
        </div>
      </div>

      <div className="bg-white neo-brutal-border neo-brutal-shadow p-6 mb-6">
        <div className="aspect-video bg-[#F5F5F5] neo-brutal-border flex items-center justify-center mb-6">
          {photoUrl ? (
            <img src={photoUrl} alt="Team" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="font-black text-gray-400">NO TEAM PHOTO SET</p>
              <p className="text-sm font-bold text-gray-400">Upload or paste a URL below</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-black text-sm mb-1">PHOTO URL</label>
            <Input
              className="neo-brutal-border-thin font-bold"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="bg-[#F5F5F5] neo-brutal-border p-4 flex items-center gap-3">
            <Upload className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-black text-sm">UPLOAD FILE</p>
              <p className="text-xs font-bold text-gray-500">Drag & drop or click to select — JPG, PNG, WebP up to 10MB</p>
            </div>
            <label className="neo-button bg-white text-black px-4 py-2 text-sm font-black cursor-pointer">
              BROWSE
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPhotoUrl(URL.createObjectURL(file));
              }} />
            </label>
          </div>

          <button onClick={handleSave} className={`neo-button px-6 py-3 font-black flex items-center gap-2 ${saved ? "bg-[#22C55E] text-black" : "bg-black text-white"}`}>
            {saved ? <><Check className="w-4 h-4" /> SAVED!</> : <><Save className="w-4 h-4" /> SAVE PHOTO</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Chatbot Refresh ─────────────────────────────────────────────────

function ChatbotSection() {
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("March 20, 2024 at 2:34 PM");

  const triggerRefresh = () => {
    setRefreshing(true);
    setConfirming(false);
    setTimeout(() => {
      setRefreshing(false);
      setLastRefresh(new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }));
    }, 3000);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-black" />
        </div>
        <div>
          <h2 className="text-3xl font-black">CHATBOT EMBEDDINGS REFRESH</h2>
          <p className="font-bold text-gray-600">Update the AI chatbot's knowledge base</p>
        </div>
      </div>

      <div className="bg-yellow-400 neo-brutal-border neo-brutal-shadow p-6 mb-6 flex items-start gap-4">
        <AlertTriangle className="w-8 h-8 text-black flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-black text-lg mb-1">COST WARNING</p>
          <p className="font-bold text-sm">
            Refreshing chatbot embeddings incurs API costs (approximately $0.05–$0.50 per refresh depending on content volume).
            This is not free. Only refresh when you have made meaningful updates to the website content, sponsors, or organizational information.
          </p>
          <p className="font-bold text-sm mt-2">
            Consider batching your updates and refreshing once rather than after every small change.
          </p>
        </div>
      </div>

      <div className="bg-white neo-brutal-border neo-brutal-shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-black text-lg">EMBEDDING STATUS</p>
            <p className="font-bold text-sm text-gray-600">Last refresh: {lastRefresh}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-black neo-brutal-border ${refreshing ? "bg-yellow-400 text-black" : "bg-[#22C55E] text-black"}`}>
            {refreshing ? "REFRESHING..." : "UP TO DATE"}
          </span>
        </div>

        <div className="space-y-2 mb-6">
          {[
            "Organization information and mission",
            "Sponsor details and partnerships",
            "Legislative updates and advocacy positions",
            "Volunteer stories and impact data",
            "Delivery and service area information",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-bold">
              <Check className="w-4 h-4 text-[#22C55E]" />
              {item}
            </div>
          ))}
        </div>

        {!confirming && !refreshing && (
          <button onClick={() => setConfirming(true)} className="neo-button bg-black text-white px-6 py-3 font-black flex items-center gap-2">
            <RefreshCw className="w-5 h-5" /> REFRESH EMBEDDINGS
          </button>
        )}

        {confirming && (
          <div className="bg-[#F5F5F5] neo-brutal-border p-4">
            <p className="font-black mb-3">ARE YOU SURE? This will incur API costs.</p>
            <div className="flex gap-3">
              <button onClick={triggerRefresh} className="neo-button bg-red-500 text-white px-5 py-2 font-black flex items-center gap-2">
                <Check className="w-4 h-4" /> YES, REFRESH NOW
              </button>
              <button onClick={() => setConfirming(false)} className="neo-button bg-white text-black px-5 py-2 font-black flex items-center gap-2">
                <X className="w-4 h-4" /> CANCEL
              </button>
            </div>
          </div>
        )}

        {refreshing && (
          <div className="flex items-center gap-3 font-black text-gray-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Regenerating embeddings... please wait
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section: Delivery Logs ───────────────────────────────────────────────────

function DeliveriesSection() {
  const [logs, setLogs] = useState<DeliveryLog[]>(mockDeliveries);

  const approveLog = (id: string) => {
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, status: "approved" } : l)));
  };

  const denyLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const deleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const approved = logs.filter((l) => l.status === "approved");
  const pending = logs.filter((l) => l.status === "pending");

  const LogCard = ({ log, variant }: { log: DeliveryLog; variant: "approved" | "pending" }) => (
    <div className="bg-white neo-brutal-border p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-black text-sm">{log.volunteerName}</p>
          <p className="text-xs font-bold text-gray-600">{log.address}</p>
          <p className="text-xs font-bold text-gray-500">{log.date}</p>
        </div>
      </div>
      <p className="text-xs font-bold text-gray-600 mb-3">{log.notes}</p>
      {variant === "approved" ? (
        <button onClick={() => deleteLog(log.id)} className="neo-button bg-red-500 text-white px-3 py-1.5 text-xs font-black flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> DELETE
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => approveLog(log.id)} className="neo-button bg-[#22C55E] text-black px-3 py-1.5 text-xs font-black flex items-center gap-1">
            <Check className="w-3 h-3" /> APPROVE
          </button>
          <button onClick={() => denyLog(log.id)} className="neo-button bg-red-500 text-white px-3 py-1.5 text-xs font-black flex items-center gap-1">
            <X className="w-3 h-3" /> DENY
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
          <Package className="w-6 h-6 text-black" />
        </div>
        <div>
          <h2 className="text-3xl font-black">DELIVERY LOGS</h2>
          <p className="font-bold text-gray-600">{approved.length} approved · {pending.length} in review</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Approved Column */}
        <div>
          <div className="bg-black text-white neo-brutal-border p-3 mb-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-[#22C55E]" />
            <span className="font-black">ALREADY ADDED ({approved.length})</span>
          </div>
          <div className="space-y-3">
            {approved.length === 0 ? (
              <div className="bg-[#F5F5F5] neo-brutal-border p-8 text-center">
                <p className="font-black text-gray-400">NO APPROVED LOGS</p>
              </div>
            ) : (
              approved.map((log) => <LogCard key={log.id} log={log} variant="approved" />)
            )}
          </div>
        </div>

        {/* Pending Column */}
        <div>
          <div className="bg-yellow-400 neo-brutal-border p-3 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-black" />
            <span className="font-black text-black">IN REVIEW ({pending.length})</span>
          </div>
          <div className="space-y-3">
            {pending.length === 0 ? (
              <div className="bg-[#F5F5F5] neo-brutal-border p-8 text-center">
                <p className="font-black text-gray-400">NO PENDING LOGS</p>
              </div>
            ) : (
              pending.map((log) => <LogCard key={log.id} log={log} variant="pending" />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Journey / Timeline ──────────────────────────────────────────────

function JourneySection() {
  const [entries, setEntries] = useState<JourneyEntry[]>(mockJourney);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const blank: Omit<JourneyEntry, "id"> = { year: "", title: "", description: "" };
  const [form, setForm] = useState<Omit<JourneyEntry, "id">>(blank);

  const startEdit = (e: JourneyEntry) => {
    setEditing(e.id);
    setForm({ year: e.year, title: e.title, description: e.description });
    setShowAdd(false);
  };

  const saveEdit = (id: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...form } : e)));
    setEditing(null);
  };

  const deleteEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const addEntry = () => {
    setEntries((prev) => [...prev, { id: Date.now().toString(), ...form }].sort((a, b) => a.year.localeCompare(b.year)));
    setForm(blank);
    setShowAdd(false);
  };

  const EntryForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block font-black text-sm mb-1">YEAR / DATE *</label>
          <Input className="neo-brutal-border-thin font-bold" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2025" />
        </div>
        <div className="md:col-span-2">
          <label className="block font-black text-sm mb-1">TITLE *</label>
          <Input className="neo-brutal-border-thin font-bold" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Major milestone or event name" />
        </div>
      </div>
      <div>
        <label className="block font-black text-sm mb-1">DESCRIPTION *</label>
        <Textarea className="neo-brutal-border-thin font-bold" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="More details about this accomplishment..." rows={3} />
      </div>
      <div className="flex gap-3">
        <button onClick={onSave} className="neo-button bg-[#22C55E] text-black px-5 py-2 font-black flex items-center gap-2">
          <Save className="w-4 h-4" /> SAVE
        </button>
        <button onClick={onCancel} className="neo-button bg-white text-black px-5 py-2 font-black flex items-center gap-2">
          <X className="w-4 h-4" /> CANCEL
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-black">JOURNEY / TIMELINE</h2>
            <p className="font-bold text-gray-600">{entries.length} milestones</p>
          </div>
        </div>
        {!showAdd && (
          <button onClick={() => { setShowAdd(true); setEditing(null); setForm(blank); }} className="neo-button bg-[#22C55E] text-black px-4 py-2 font-black flex items-center gap-2">
            <Plus className="w-4 h-4" /> ADD MILESTONE
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white neo-brutal-border neo-brutal-shadow p-6 mb-6">
          <h3 className="font-black text-xl mb-4">NEW MILESTONE</h3>
          <EntryForm onSave={addEntry} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-black hidden md:block" />

        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="md:pl-16 relative">
              {/* Year dot */}
              <div className="hidden md:flex absolute left-0 top-4 w-12 h-12 bg-[#22C55E] neo-brutal-border items-center justify-center">
                <Calendar className="w-5 h-5 text-black" />
              </div>

              <div className="bg-white neo-brutal-border neo-brutal-shadow p-5">
                {editing === entry.id ? (
                  <>
                    <h3 className="font-black text-base mb-4">EDITING: {entry.year} — {entry.title}</h3>
                    <EntryForm onSave={() => saveEdit(entry.id)} onCancel={() => setEditing(null)} />
                  </>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="bg-black text-white px-3 py-1 font-black neo-brutal-border text-sm">{entry.year}</span>
                        <span className="font-black text-lg">{entry.title}</span>
                      </div>
                      <p className="font-bold text-gray-600 text-sm">{entry.description}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => startEdit(entry)} className="neo-button bg-white px-3 py-2 text-xs font-black flex items-center gap-1">
                        <Edit2 className="w-3 h-3" /> EDIT
                      </button>
                      <button onClick={() => deleteEntry(entry.id)} className="neo-button bg-red-500 text-white px-3 py-2 text-xs font-black flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> DELETE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function Admin() {
  const [activeSection, setActiveSection] = useState<AdminSection>("users");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeNav = navItems.find((n) => n.id === activeSection)!;

  const renderSection = () => {
    switch (activeSection) {
      case "users": return <UsersSection />;
      case "sponsors": return <SponsorsSection />;
      case "heatmap": return <HeatmapSection />;
      case "heatmap-insights": return <HeatmapInsightsSection />;
      case "legislative": return <LegislativeSection />;
      case "leadership": return <LeadershipSection />;
      case "team-photo": return <TeamPhotoSection />;
      case "chatbot": return <ChatbotSection />;
      case "deliveries": return <DeliveriesSection />;
      case "journey": return <JourneySection />;
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-black py-12 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <div className="inline-block bg-[#22C55E] text-black px-4 py-2 neo-brutal-border mb-3">
              <span className="font-black text-sm">ADMIN DASHBOARD</span>
            </div>
            <h1 className="text-5xl font-black text-white">CONTROL CENTER</h1>
            <p className="text-lg font-bold text-gray-400 mt-2">Manage all aspects of Project Wampus</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="w-16 h-16 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
              <Shield className="w-8 h-8 text-black" />
            </div>
          </div>
        </div>
      </section>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white neo-brutal-border border-r-4 border-t-0 flex-shrink-0">
          <div className="p-4 bg-[#F5F5F5] neo-brutal-border border-b-2 border-t-0 border-l-0 border-r-0">
            <p className="font-black text-xs text-gray-500 uppercase tracking-wider">Navigation</p>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-black text-sm transition-all ${
                    isActive
                      ? "bg-[#22C55E] text-black neo-brutal-border neo-brutal-shadow-sm"
                      : "text-gray-700 hover:bg-[#F5F5F5] neo-brutal-border border-transparent hover:border-black"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-left">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white neo-brutal-border border-t-4 z-50">
          <div className="flex overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 min-w-fit font-black text-xs flex-shrink-0 ${
                    isActive ? "bg-[#22C55E] text-black" : "text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="whitespace-nowrap">{item.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 bg-[#F5F5F5]">
          <div className="max-w-4xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
