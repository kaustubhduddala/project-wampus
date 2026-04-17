import { useEffect, useState } from "react";
import { Heart, Users, Target, Award, Calendar, TrendingUp, Megaphone, AlertCircle, CheckCircle, Clock, FileText, ExternalLink } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { getAdvocacyUpdates, type AdvocacyUpdate } from "@/api/publicApi";
import { EXTERNAL_LINKS, openExternalUrl } from "@/config/externalLinks";

export default function About() {
  const [updates, setUpdates] = useState<AdvocacyUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [updatesError, setUpdatesError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadUpdates = async () => {
      setLoadingUpdates(true);
      setUpdatesError(null);

      try {
        const payload = await getAdvocacyUpdates();
        if (mounted) {
          setUpdates(payload);
        }
      } catch (error) {
        if (mounted) {
          setUpdates([]);
          setUpdatesError(error instanceof Error ? error.message : "Failed to load legislative updates");
        }
      } finally {
        if (mounted) {
          setLoadingUpdates(false);
        }
      }
    };

    loadUpdates();

    return () => {
      mounted = false;
    };
  }, []);

  const milestones = [
    { year: "2021", event: "Project Wampus Founded", description: "Started with 5 students and a vision" },
    { year: "2022", event: "First 1,000 Meals", description: "Reached our first major milestone" },
    { year: "2023", event: "Partnership Program Launch", description: "Began working with local businesses" },
    { year: "2024", event: "50,000+ Meals Delivered", description: "Expanded to 100+ active volunteers" },
  ];

  const values = [
    { icon: Heart, title: "COMPASSION", description: "Leading with empathy in every interaction" },
    { icon: Users, title: "COMMUNITY", description: "Building bridges between neighbors" },
    { icon: Target, title: "IMPACT", description: "Data-driven approach to maximum effect" },
    { icon: Award, title: "EXCELLENCE", description: "High standards in everything we do" },
  ];

  const getImpactColor = (impact: string | null) => {
    switch (impact) {
      case "positive": return "bg-[#22C55E] text-white";
      case "negative": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "passed":
      case "signed":
        return <CheckCircle className="w-5 h-5" />;
      case "defeated":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const handlePetitionClick = () => {
    openExternalUrl(EXTERNAL_LINKS.PETITION_URL, "Petition");
  };

  const handleContactRepClick = () => {
    openExternalUrl(EXTERNAL_LINKS.CONTACT_REP_URL, "Contact representative");
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[#22C55E] py-20 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-black mb-6 text-white">ABOUT PROJECT WAMPUS</h1>
          <p className="text-2xl font-bold text-black max-w-3xl mx-auto">
            We're a student-led organization at UT Austin fighting homelessness one meal at a time.
          </p>
        </div>
      </section>

      {/* History Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block bg-black text-white px-4 py-2 neo-brutal-border mb-6">
              <span className="font-black text-sm">OUR STORY</span>
            </div>
            <h2 className="text-4xl font-black mb-6">FROM IDEA TO IMPACT</h2>
            <div className="space-y-4 text-lg font-bold">
              <p>
                Project Wampus began in 2021 when a group of UT Austin students recognized 
                the growing homelessness crisis in Austin and decided to take action.
              </p>
              <p>
                What started as weekend meal distributions has grown into a comprehensive 
                organization addressing homelessness through direct aid, advocacy, and 
                community partnerships.
              </p>
              <p>
                Today, we're proud to be one of Austin's most active student-led organizations 
                fighting homelessness, with over 100 volunteers and partnerships with local 
                businesses and shelters.
              </p>
            </div>
          </div>
          <div className="bg-white neo-brutal-border neo-brutal-shadow p-8">
            <div className="aspect-square bg-[#F5F5F5] neo-brutal-border flex items-center justify-center">
              <div className="text-center">
                <Users className="w-24 h-24 mx-auto mb-4 text-[#22C55E]" />
                <p className="font-black text-2xl">TEAM PHOTO</p>
                <p className="text-sm text-gray-600">Our volunteers in action</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-black text-white py-16 neo-brutal-border border-y-4">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black mb-12 text-center">OUR JOURNEY</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="bg-white text-black neo-brutal-border p-6">
                <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border-thin flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2">{milestone.year}</h3>
                <h4 className="font-black text-lg mb-2">{milestone.event}</h4>
                <p className="text-sm font-bold">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-black mb-6">OUR VISION</h2>
          <div className="bg-[#22C55E] neo-brutal-border neo-brutal-shadow p-8">
            <p className="text-2xl font-black text-white leading-relaxed">
              A future where no one in Austin goes hungry or without shelter. 
              We envision a city where community support, effective policy, and 
              compassionate action come together to end homelessness.
            </p>
          </div>
        </div>

        <h2 className="text-4xl font-black mb-8">OUR VALUES</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {values.map((value, idx) => (
            <div key={idx} className="bg-white neo-brutal-border neo-brutal-shadow p-8">
              <div className="w-16 h-16 bg-[#22C55E] neo-brutal-border flex items-center justify-center mb-4">
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3">{value.title}</h3>
              <p className="text-lg font-bold">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Stats */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-[#F5F5F5] neo-brutal-border neo-brutal-shadow p-12">
          <h2 className="text-4xl font-black mb-8 text-center">BY THE NUMBERS</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-black neo-brutal-border mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-[#22C55E]" />
              </div>
              <p className="text-5xl font-black mb-2">300%</p>
              <p className="font-bold">GROWTH SINCE 2021</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-black neo-brutal-border mx-auto mb-4 flex items-center justify-center">
                <Users className="w-10 h-10 text-[#22C55E]" />
              </div>
              <p className="text-5xl font-black mb-2">100+</p>
              <p className="font-bold">ACTIVE VOLUNTEERS</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-black neo-brutal-border mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-10 h-10 text-[#22C55E]" />
              </div>
              <p className="text-5xl font-black mb-2">52</p>
              <p className="font-bold">WEEKS OF SERVICE</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-black text-white py-16 neo-brutal-border border-y-4">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black mb-8 text-center">LEADERSHIP TEAM</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["President", "Operations Lead", "Advocacy Lead"].map((role, idx) => (
              <div key={idx} className="bg-white text-black neo-brutal-border p-6">
                <div className="w-full aspect-square bg-[#F5F5F5] neo-brutal-border-thin mb-4 flex items-center justify-center">
                  <Users className="w-16 h-16 text-[#22C55E]" />
                </div>
                <h3 className="text-xl font-black mb-2">{role}</h3>
                <p className="font-bold">Leadership bio placeholder</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advocacy Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#22C55E] neo-brutal-border mx-auto mb-6 flex items-center justify-center">
            <Megaphone className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-5xl font-black mb-6">ADVOCACY & POLICY</h2>
          <p className="text-xl font-bold max-w-3xl mx-auto">
            Fighting for policy change that supports people experiencing homelessness
          </p>
        </div>

        <div className="bg-black text-white neo-brutal-border neo-brutal-shadow p-8 mb-12">
          <h3 className="text-3xl font-black mb-4">WHY ADVOCACY MATTERS</h3>
          <p className="text-lg font-bold leading-relaxed">
            Direct aid is crucial, but lasting change requires systemic solutions. Project Wampus 
            actively monitors and responds to legislation affecting homelessness in Austin and Texas. 
            We advocate for compassionate policies, oppose harmful bills, and work to amplify the 
            voices of those experiencing homelessness.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white neo-brutal-border neo-brutal-shadow p-6">
            <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border mb-4 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black mb-2">MONITOR</h3>
            <p className="font-bold">Track legislation that impacts homeless communities</p>
          </div>
          <div className="bg-white neo-brutal-border neo-brutal-shadow p-6">
            <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border mb-4 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black mb-2">ADVOCATE</h3>
            <p className="font-bold">Rally support for positive policy changes</p>
          </div>
          <div className="bg-white neo-brutal-border neo-brutal-shadow p-6">
            <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border mb-4 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black mb-2">OPPOSE</h3>
            <p className="font-bold">Fight against harmful anti-homeless legislation</p>
          </div>
        </div>

        {/* Legislative Updates */}
        <h3 className="text-4xl font-black mb-8">LEGISLATIVE UPDATES</h3>

        {loadingUpdates && (
          <div className="bg-white neo-brutal-border-thin p-4 mb-6">
            <p className="font-bold">Loading legislative updates...</p>
          </div>
        )}
        {updatesError && (
          <div className="bg-yellow-100 neo-brutal-border-thin p-4 mb-6">
            <p className="font-bold text-yellow-800">Could not load updates: {updatesError}</p>
          </div>
        )}
        
        {updates.length === 0 ? (
          <div className="bg-[#F5F5F5] neo-brutal-border neo-brutal-shadow p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="font-black text-xl mb-2">NO UPDATES YET</p>
            <p className="font-bold text-gray-600">Legislative updates will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {updates.map((update) => (
              <div key={update.id} className="bg-white neo-brutal-border neo-brutal-shadow p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${getImpactColor(update.impact)} neo-brutal-border flex items-center justify-center`}>
                      {getStatusIcon(update.status)}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black">{update.title}</h4>
                      {update.bill_number && (
                        <p className="text-sm font-bold text-gray-600">{update.bill_number}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${getImpactColor(update.impact)} neo-brutal-border-thin font-black`}>
                      {update.impact?.toUpperCase()}
                    </Badge>
                    {update.priority === "high" && (
                      <Badge className="bg-red-500 text-white neo-brutal-border-thin font-black">
                        HIGH PRIORITY
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-lg font-bold leading-relaxed">{update.content}</p>
                </div>

                {update.action_taken && (
                  <div className="bg-[#22C55E] neo-brutal-border-thin p-4 mb-4">
                    <h5 className="font-black mb-2 text-white">PJW ACTION TAKEN:</h5>
                    <p className="font-bold text-white">{update.action_taken}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-600">
                      Status: <span className="text-black font-black">{update.status?.toUpperCase()}</span>
                    </span>
                  </div>
                  {update.link_url && (
                    <a
                      href={update.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-black hover:text-[#22C55E]"
                    >
                      VIEW LEGISLATION <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Take Action */}
        <div className="bg-black text-white neo-brutal-border neo-brutal-shadow p-12 text-center mt-12">
          <h3 className="text-4xl font-black mb-6">GET INVOLVED IN ADVOCACY</h3>
          <p className="text-xl font-bold mb-8 max-w-2xl mx-auto">
            Your voice matters. Join us in advocating for policies that support homeless communities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button type="button" onClick={handlePetitionClick} className="neo-button bg-[#22C55E] text-white px-8 py-4 font-black">
              SIGN OUR PETITION
            </button>
            <button type="button" onClick={handleContactRepClick} className="neo-button bg-white text-black px-8 py-4 font-black">
              CONTACT YOUR REP
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
