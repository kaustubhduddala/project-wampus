/**
 * Mock delivery events and resources for Map Dashboard (no API).
 * Design: Project Wampus Map + Heatmap/Hexbin MVP — client-side only.
 */

import { latLngToCell, polygonToCells, cellToBoundary, cellToLatLng } from "h3-js";
// ADD: Esri‑Leaflet client (used only to fetch the Feature Service)
import * as EL from "esri-leaflet";

// ADD: Austin HSO layer (sublayer 2) — the URL you provided
const ARC_LAYER_URL =
  "https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/Austin_HSO_Homeless_Resources_Finder/FeatureServer/2";

export interface DeliveryEvent {
  id: number;
  timestamp: string; // ISO UTC
  lat: number;
  lng: number;
  notes?: string;
}

export interface ResourceLocation {
  id: number;
  name: string;
  type: "shelter" | "pantry" | "outreach" | "other";
  lat: number;
  lng: number;
  hours?: string;
  contact_info?: string;
}

/** Grid cell for coverage or priority overlay */
export interface GridCell {
  cell_id: string;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  polygon: [number, number][]; // lat,lng ring (closed)
  meals_sum: number; // kept for compatibility; now equals visit_count
  visit_count: number;
  last_served: string | null; // ISO
  // Priority-only
  priority_score?: number;
  served_meals_30d?: number; // kept for compatibility; now equals recent visits
  last_served_days?: number;
  nearest_resource?: string;
  dist_to_resource_m?: number;
  reason?: string[];
  /** Set when showing priority spotlight: 0–1 within the visible (top %) set for coloring */
  normalizedPriority?: number;
}

// West Campus Austin bounds (approximate)
const WEST_CAMPUS_BOUNDS = {
  south: 30.278,
  north: 30.298,
  west: -97.755,
  east: -97.725,
};

/** H3 resolution for hexbin (10 ≈ ~66m edge, small hexes for West Campus) */
const H3_RES = 10;

/** Mock delivery events spread over last 90 days (each event = one delivery) */
export const MOCK_DELIVERY_EVENTS: DeliveryEvent[] = [
  {
    id: 1,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2850878,
    lng: -97.7419413,
    notes:
      "Notes: Usually the same singular man, or collection of 3 men on a bench at this street corner."
  },
  {
    id: 2,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.286301,
    lng: -97.741841,
    notes:
      "Note: Occasionally we see homeless people down this stretch of guad, but it isnt as consistent as other markers."
  },
  {
    id: 3,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2877866,
    lng: -97.7414015,
    notes:
      "There is often a person or two on the steps outside the church here whom we try to feed."
  },
  {
    id: 4,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2876426,
    lng: -97.7418909,
    notes:
      "Often a person or two around this corner who we are able to feed"
  },
  {
    id: 5,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2888374,
    lng: -97.7419425,
    notes:
      "On Mondays, there are a large congregation of Homeless here for a weekly clothing drive that occurs at 5pm, we will be feeding them there next semester"
  },
  {
    id: 6,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2901841,
    lng: -97.7414667,
    notes:
      "There is sometimes a person or two seated at the bench outside moxie who we can feed"
  },
  {
    id: 7,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2905661,
    lng: -97.7418717,
    notes:
      "There are always people outside the seven eleven directly, and in the alley"
  },
  {
    id: 8,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2907722,
    lng: -97.7417604,
    notes: "Here as well"
  },
  {
    id: 9,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2910987,
    lng: -97.7414008,
    notes:
      "This Bus stop is a very consistently populated Homeless marker"
  },
  {
    id: 10,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2919142,
    lng: -97.7415616,
    notes: "Occasionally a couple people on this side of Taos"
  },
  {
    id: 11,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2921968,
    lng: -97.7414999,
    notes: "Consistently people here"
  },
  {
    id: 12,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2921412,
    lng: -97.7417627,
    notes: "Consistently people here"
  },
  {
    id: 13,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2921075,
    lng: -97.7428622,
    notes:
      "down this stretch of Nueces but particularly here, there are often homless people lingering here"
  },
  {
    id: 14,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2932371,
    lng: -97.7418843,
    notes: "A few homless can be seen here as well"
  },
  {
    id: 15,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2935776,
    lng: -97.7422705,
    notes: "A few homless can be seen here as well"
  },
  {
    id: 16,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2955212,
    lng: -97.7428514
  },
  {
    id: 17,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2954054,
    lng: -97.7426315
  },
  {
    id: 18,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2953661,
    lng: -97.7429372
  },
  {
    id: 19,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2955893,
    lng: -97.7427801,
    notes:
      "Any bus stop is going to be a dependable hotspot for the homless."
  },
  {
    id: 20,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2947636,
    lng: -97.742283,
    notes:
      "there is always at least one or two people near this gas station"
  },
  {
    id: 21,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2977597,
    lng: -97.7411599,
    notes:
      "Always some people hanging at this bus stop outside wheatsville"
  },
  {
    id: 22,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2975422,
    lng: -97.7412238
  },
  {
    id: 23,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2974154,
    lng: -97.7410334,
    notes:
      "Apart from infront or pn the benches at wheatsville, pay attention to behind the dumpsters. we always find a coupple keeping warm behind it"
  },
  {
    id: 24,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2903164,
    lng: -97.7476951,
    notes: "a few homless sometimes at the bench here"
  },
  {
    id: 25,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2900756,
    lng: -97.747553,
    notes: "often a coupple homless on the bench here"
  },
  {
    id: 26,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2896841,
    lng: -97.74762,
    notes: "often one or two outside the o mart"
  },
  {
    id: 27,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2893758,
    lng: -97.7479779,
    notes: "often a gorup of 3-4 on the benches here"
  },
  {
    id: 28,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2869512,
    lng: -97.7448126,
    notes: "often a few people here at this bench"
  },
  {
    id: 29,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2864091,
    lng: -97.7448984,
    notes: "often a few people on this curb"
  },
  {
    id: 30,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2867153,
    lng: -97.74268,
    notes:
      "Always some activity out here infront of the chucrch"
  },
  {
    id: 31,
    timestamp: "2026-02-12T14:00:00Z",
    lat: 30.2903645,
    lng: -97.7445813,
    notes:
      "frequently a homeless person or two inside the food trucks square"
  }
];

/** Mock resource locations (shelters, pantries) */
export const MOCK_RESOURCES: ResourceLocation[] = [
  { id: 1,  name: "Violet KeepSafe Storage",                        type: "other",            lat: 30.2671793484391, lng: -97.7352217019655 },

  { id: 3,  name: "Sunrise HUB",                                    type: "outreach",  lat: 30.2288135374708, lng: -97.7894734015289 },
  { id: 4,  name: "Charlie Center - Mosaic Church",                 type: "outreach",  lat: 30.4326639792242, lng: -97.7648079757563 },
  { id: 5,  name: "Lifeworks Youth Resource Center",                type: "outreach",     lat: 30.2646052272508, lng: -97.707804245162 },
  { id: 6,  name: "Austin Street Youth Ministry Basic Needs Closet",type: "outreach",     lat: 30.34495737853,   lng: -97.7350854119941 },
  { id: 7,  name: "Micah 6 Street Youth Drop-in Center",            type: "outreach",     lat: 30.2846230149468, lng: -97.7425619867976 },
  { id: 8,  name: "Austin Recreation Center",                       type: "outreach",   lat: 30.27865099309,   lng: -97.7495059729295 },

  { id: 11, name: "Dittmar Recreational Center",                    type: "outreach",   lat: 30.184832727962,  lng: -97.8017568299741 },
  { id: 13, name: "Dove Springs Recreation Center",                 type: "outreach",   lat: 30.187434080979,  lng: -97.7382141104972 },
  { id: 15, name: "Gus Garcia Recreational Center",                 type: "outreach",   lat: 30.3538268152769, lng: -97.6816589926192 },
  { id: 20, name: "Northwest Recreational Center",                  type: "outreach",   lat: 30.333721982162,  lng: -97.7518890318026 },
  { id: 24, name: "Turner-Roberts Recreation Center",               type: "outreach",   lat: 30.3003988883405, lng: -97.6360368813062 },
  { id: 27, name: "St. Andrew’s-Meal and Shower",                   type: "outreach",   lat: 30.4368576550592, lng: -97.6749119800797 },

  { id: 28, name: "Parque Zaragoza Recreation Center",              type: "outreach",     lat: 30.2616878998895, lng: -97.7115189001394 },
  { id: 29, name: "Pan Am Recreation Center",                       type: "outreach",     lat: 30.2581310040614, lng: -97.7207869746376 },
  { id: 30, name: "Alamo Recreation Center",                        type: "outreach",     lat: 30.2828036002251, lng: -97.7201045008542 },
  { id: 31, name: "Asian American Resource Center",                 type: "outreach",     lat: 30.3400795003301, lng: -97.6810655996786 },
  { id: 32, name: "Austin Central Library",                         type: "outreach",     lat: 30.2657787002956, lng: -97.7519331004581 },
  { id: 33, name: "Austin Nature & Science Center",                 type: "outreach",     lat: 30.2721723995491, lng: -97.7733194999329 },
  { id: 35, name: "Lorraine \"Grandma\" Camacho Activity Center",   type: "outreach",     lat: 30.249520499655,  lng: -97.7233654994216 },
  { id: 36, name: "Carver Branch, Austin Public Library",           type: "outreach",     lat: 30.2695730001854, lng: -97.7242180006262 },
  { id: 37, name: "George Washington Carver Museum",                type: "outreach",     lat: 30.2700349998175, lng: -97.7240078002396 },
  { id: 38, name: "Cepeda Branch, Austin Public Library",           type: "outreach",     lat: 30.2591246006112, lng: -97.7088354994326 },
  { id: 39, name: "Conley-Guerrero Senior Activity Center",         type: "outreach",     lat: 30.2658332999387, lng: -97.7111111000322 },
  { id: 40, name: "Dittmar Recreation Center",                      type: "outreach",     lat: 30.185050000119,  lng: -97.8020854004674 },
  { id: 41, name: "Delores Duffie Recreation Center",               type: "outreach",     lat: 30.2716274005345, lng: -97.7143629995641 },

  { id: 44, name: "Hampton Branch at Oak Hill, Austin Public Library", type: "outreach",   lat: 30.2175914001682, lng: -97.8549415998477 },
  { id: 45, name: "Hancock Recreation Center",                      type: "outreach",     lat: 30.2989817002995, lng: -97.7244669004352 },
  { id: 46, name: "Howson Branch, Austin Public Library",           type: "outreach",     lat: 30.2982409997613, lng: -97.7675161002281 },
  { id: 47, name: "Dottie Jordan Recreation Center",                type: "outreach",     lat: 30.3141765000595, lng: -97.6735428002655 },
  { id: 49, name: "Lamar Senior Activity Center",                   type: "outreach",     lat: 30.2971004996452, lng: -97.7485931004463 },
  { id: 50, name: "Little Walnut Creek Branch, Austin Public Library", type: "outreach",   lat: 30.3632510006666, lng: -97.6984793004257 },
  { id: 51, name: "McBeth Recreation Center",                       type: "outreach",     lat: 30.2657855000327, lng: -97.7788529999121 },
  { id: 52, name: "Menchaca Road Branch, Austin Public Library",    type: "outreach",     lat: 30.2164576000227, lng: -97.7972974994815 },
  { id: 53, name: "Rodolfo \"Rudy\" Mendez Recreation Center",      type: "outreach",     lat: 30.2522785651466, lng: -97.7183996519861 },
  { id: 54, name: "Milwood Branch, Austin Public Library",          type: "outreach",     lat: 30.4222331999294, lng: -97.7161654000114 },
  { id: 55, name: "Montopolis Recreation and Community Center",     type: "outreach",     lat: 30.2321918004451, lng: -97.6998610997781 },
  { id: 57, name: "John Gillum Branch, Austin Public Library",      type: "outreach",     lat: 30.3621575004339, lng: -97.7304778999038 },
  { id: 58, name: "Northwest Recreation Center",                    type: "outreach",     lat: 30.3337018002044, lng: -97.7519120008287 },
  { id: 60, name: "Pickfair Community Center",                      type: "outreach",     lat: 30.4394312004398, lng: -97.8109576994084 },
  { id: 61, name: "Pleasant Hill Branch, Austin Public Library",    type: "outreach",     lat: 30.1922470000788, lng: -97.777166100355 },
  { id: 62, name: "Ruiz Branch, Austin Public Library",             type: "outreach",     lat: 30.2298764998623, lng: -97.7067775992539 },
  { id: 63, name: "St. John Branch, Austin Public Library",         type: "outreach",     lat: 30.332040599736,  lng: -97.6937090998417 },
  { id: 64, name: "South Austin Recreation Center",                 type: "outreach",     lat: 30.2416666998748, lng: -97.7686111007454 },
  { id: 65, name: "South Austin Senior Activity Center",            type: "outreach",     lat: 30.2331822994921, lng: -97.7845456005114 },
  { id: 66, name: "Southeast Branch, Austin Public Library",        type: "outreach",     lat: 30.1876810000409, lng: -97.7420340001953 },
  { id: 67, name: "Spicewood Springs Branch, Austin Public Library",type: "outreach",     lat: 30.4337082995491, lng: -97.7730809002043 },
  { id: 68, name: "Terrazas Branch, Austin Public Library",         type: "outreach",     lat: 30.2599070002485, lng: -97.7334400002326 },
  { id: 69, name: "Turner Roberts Recreation Center",               type: "outreach",     lat: 30.3000214000607, lng: -97.6366892001363 },
  { id: 70, name: "Twin Oaks Branch, Austin Public Library",        type: "outreach",     lat: 30.2486705000308, lng: -97.7623757003197 },
  { id: 71, name: "University Hills Branch, Austin Public Library", type: "outreach",     lat: 30.3088197996658, lng: -97.6664907998055 },
  { id: 72, name: "Windsor Park Branch, Austin Public Library",     type: "outreach",     lat: 30.3115264995687, lng: -97.6903153006308 },
  { id: 73, name: "Yarborough Branch, Austin Public Library",       type: "outreach",     lat: 30.3234702003055, lng: -97.7407240993059 },

  { id: 76, name: "Psychiatric Emergency Services (PES)",           type: "outreach",      lat: 30.2747560060977, lng: -97.6980069734661 },
  { id: 77, name: "Integral Care St. John Clinic",                  type: "outreach",      lat: 30.3310639971574, lng: -97.7039860364556 },
  { id: 78, name: "Integral Care Dove Springs Clinic",              type: "outreach",      lat: 30.2047790168834, lng: -97.7578100086016 },
  { id: 79, name: "Integral Care East 2nd Street Clinic",           type: "outreach",      lat: 30.2586909990124, lng: -97.7273629967746 },
  { id: 80, name: "Integral Care Stonegate Clinic",                 type: "outreach",      lat: 30.2053170235571, lng: -97.8126605531256 },
  { id: 81, name: "Integral Care Oak Springs Clinic",               type: "outreach",      lat: 30.2736080206364, lng: -97.7006269887585 },

  { id: 82, name: "ARCH CommUnityCare Clinic",                      type: "outreach",  lat: 30.2679480147884, lng: -97.7376220271655 },
  { id: 83, name: "Black Men's Health Clinic",                      type: "outreach",  lat: 30.3203829798504, lng: -97.6928889833846 },
  { id: 84, name: "Capital Plaza Specialty Clinic",                 type: "outreach",  lat: 30.3122430203165, lng: -97.7076739900422 },
  { id: 85, name: "Care Connections Clinic",                        type: "outreach",  lat: 30.2287759865794, lng: -97.7689089895105 },
  { id: 86, name: "Chalmers Court Health Center",                   type: "outreach",  lat: 30.2593799914533, lng: -97.7237929765736 },
  { id: 87, name: "David Powell HIV Health Center",                 type: "outreach",  lat: 30.3053639923734, lng: -97.7137979761325 },
  { id: 88, name: "East Austin Health Center",                      type: "outreach",  lat: 30.2595809894914, lng: -97.7275469795486 },
  { id: 90, name: "Hornsby Bend Health and Wellness Center",        type: "outreach",  lat: 30.240241338208,  lng: -97.5908586417756 },
  { id: 91, name: "North Central Health Center",                    type: "outreach",  lat: 30.3856660194654, lng: -97.6939610288005 },
  { id: 92, name: "Oak Hill Health Center",                         type: "outreach",  lat: 30.251454664956,  lng: -97.8937002208437 },
  { id: 93, name: "Women's OB/GYN Clinic at Carousel Pediatrics East Riverside", type: "outreach", lat: 30.238118868485, lng: -97.7268620091553 },
  { id: 94, name: "Women's OB/GYN Clinic Springdale",               type: "outreach",  lat: 30.3131089171534, lng: -97.6639590778297 },
  { id: 95, name: "Rundberg Health Center",                         type: "outreach",  lat: 30.3565343397993, lng: -97.6858258384681 },
  { id: 96, name: "Sandra Joy Anderson Community Health and Wellness Center", type: "outreach", lat: 30.2664240171534, lng: -97.7222040191886 },
  { id: 97, name: "South Austin Health Center",                     type: "outreach",  lat: 30.2394749830684, lng: -97.7606919583706 },
  { id: 98, name: "Southeast Walk-in Clinic",                       type: "outreach",  lat: 30.2143550059844, lng: -97.7096879937295 },
  { id: 99, name: "William Cannon Health Center",                   type: "outreach",  lat: 30.1876949799213, lng: -97.7708509926575 },

  { id: 100, name: "Angel House Soup Kitchen",                      type: "pantry",               lat: 30.2608026726214, lng: -97.734849071138 },
  { id: 101, name: "Caritas of Austin - Lunch",                     type: "pantry",               lat: 30.267421370875,  lng: -97.737898376529 },
  { id: 102, name: "Trinity Center Meals",                          type: "pantry",               lat: 30.2682002711674, lng: -97.7392164858078 },
  { id: 103, name: "Texas Harm Reduction Alliance Drop-in Center",  type: "outreach", lat: 30.2572030016538, lng: -97.7254329797511 },
  { id: 104, name: "Mobile Texas Harm Reduction Alliance near CMS South", type: "outreach", lat: 30.2003591247057, lng: -97.7947850616055 },
  { id: 105, name: "Mobile Texas Harm Reduction Alliance St. Johns Neighborhood", type: "outreach", lat: 30.3326108418834, lng: -97.7002136516778 },
  { id: 106, name: "Mobile Texas Harm Reduction Alliance at East Oltorf", type: "outreach", lat: 30.2311743796494, lng: -97.7336653274689 },
  { id: 107, name: "Mobile Texas Harm Reduction Alliance Near Springdale and Oak Springs", type: "outreach", lat: 30.2740146429938, lng: -97.6912783962339 },
  { id: 108, name: "University United Methodist Church Open Door Ministry Saturday Breakfast", type: "pantry", lat: 30.2882211982704, lng: -97.7411142633046 },
  { id: 109, name: "Central Texas Food Bank", type: "pantry", lat: 30.2591, lng: -97.7214 },
  { id: 110, name: "Front Steps", type: "shelter", lat: 30.2695, lng: -97.7388 },

  { id: 112, name: "Sunrise Community Church Pantry", type: "pantry", lat: 30.2821, lng: -97.7321 },
  { id: 113, name: "Caritas of Austin", type: "shelter", lat: 30.2713, lng: -97.7432 },
];

export type TimeFilterKey = "7" | "30" | "90" | "all";

/** Get start date for time filter (UTC) */
export function getFilterStartDate(key: TimeFilterKey): Date | null {
  const now = new Date();
  if (key === "all") return null;
  const d = new Date(now);
  if (key === "7") d.setDate(d.getDate() - 7);
  else if (key === "30") d.setDate(d.getDate() - 30);
  else if (key === "90") d.setDate(d.getDate() - 90);
  return d;
}

export function filterEventsByTime(events: DeliveryEvent[], key: TimeFilterKey): DeliveryEvent[] {
  const start = getFilterStartDate(key);
  if (!start) return [...events];
  return events.filter((e) => new Date(e.timestamp) >= start);
}

/** Get H3 hex cell id for a point (used for aggregation) */
function getCellKey(lat: number, lng: number): string {
  return latLngToCell(lat, lng, H3_RES);
}

/** Get H3 cell id for an event (for filtering events by hex) */
export function getEventCellId(event: DeliveryEvent): string {
  return latLngToCell(event.lat, event.lng, H3_RES);
}

/** Haversine distance in meters */
function distMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function cellCenter(cell: GridCell): [number, number] {
  const [lat, lng] = cellToLatLng(cell.cell_id);
  return [lat, lng];
}

/** West Campus as a single closed ring [lat, lng] for H3 polygonToCells */
function westCampusRing(): [number, number][] {
  const { south, north, west, east } = WEST_CAMPUS_BOUNDS;
  return [[south, west], [north, west], [north, east], [south, east], [south, west]];
}

/** Bounds from hex polygon (min/max lat and lng) */
function polygonBounds(polygon: [number, number][]): [[number, number], [number, number]] {
  const lats = polygon.map(([lat]) => lat);
  const lngs = polygon.map(([, lng]) => lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

/** Build hexbin coverage grid; aggregate filtered events into H3 cells (no API) */
export function buildCoverageGrid(events: DeliveryEvent[]): GridCell[] {
  const byCell = new Map<
    string,
    { visits: number; lastDate: Date | null }
  >();

  for (const e of events) {
    if (
      e.lat < WEST_CAMPUS_BOUNDS.south ||
      e.lat > WEST_CAMPUS_BOUNDS.north ||
      e.lng < WEST_CAMPUS_BOUNDS.west ||
      e.lng > WEST_CAMPUS_BOUNDS.east
    ) continue;

    const key = getCellKey(e.lat, e.lng);
    const date = new Date(e.timestamp);
    const existing = byCell.get(key);
    if (!existing) {
      byCell.set(key, { visits: 1, lastDate: date });
    } else {
      existing.visits += 1;
      if (date > existing.lastDate!) existing.lastDate = date;
    }
  }

  const ring = westCampusRing();
  const hexIds = polygonToCells(ring, H3_RES);

  const cells: GridCell[] = hexIds.map((cellId) => {
    const boundary = cellToBoundary(cellId);
    const polygon: [number, number][] = [...boundary.map(([lat, lng]) => [lat, lng] as [number, number]), boundary[0]];
    const bounds = polygonBounds(polygon);
    const data = byCell.get(cellId);
    const visits = data?.visits ?? 0;
    return {
      cell_id: cellId,
      bounds,
      polygon,
      meals_sum: visits,     // backward compatible: now equal to visit count
      visit_count: visits,
      last_served: data?.lastDate ? data.lastDate.toISOString() : null,
    };
  });

  return cells;
}

/** Priority weights (explainable MVP) */
const W1 = 0.5;
const W2 = 0.3;
const W3 = 0.2;
// ------------------------------
// Multi-resource influence settings (tweak as needed)
// ------------------------------
const K_NEAREST_RESOURCES = 3;            // how many nearest resources to consider
const RESOURCE_DECAY_M = 300;             // lambda (meters) for exp(-d / lambda)
const RESOURCE_TYPE_WEIGHT: Record<ResourceLocation["type"], number> = {
  pantry: 1.0,
  shelter: 0.9,
  outreach: 0.6,
  other: 0.5,
};

/**
 * Compute multi-resource proximity density for a point using the K nearest resources.
 * Returns:
 *  - density in [0, 1] (higher = more/closer resources)
 *  - nearest: the top K resources with distances (meters), for explainability
 */
function multiResourceInfluence(
  lat: number,
  lng: number,
  resources: ResourceLocation[],
  k: number = K_NEAREST_RESOURCES,
  lambdaM: number = RESOURCE_DECAY_M
): { density: number; nearest: { name: string; dist: number }[] } {
  if (!resources.length) return { density: 0, nearest: [] };

  // compute distances to all resources
  const scored = resources.map((r) => {
    const d = distMeters(lat, lng, r.lat, r.lng);
    const wType = RESOURCE_TYPE_WEIGHT[r.type] ?? 0.5;
    // kernel contribution per resource
    const kVal = wType * Math.exp(-d / lambdaM);
    return { name: r.name, dist: d, wType, kVal };
  });

  // take k nearest resources
  scored.sort((a, b) => a.dist - b.dist);
  const nearest = scored.slice(0, Math.max(1, k));

  // normalize density to 0..1 by the sum of their type weights (max contribution if d=0)
  const sumWeights = nearest.reduce((s, r) => s + r.wType, 0) || 1;
  const sumKernel  = nearest.reduce((s, r) => s + r.kVal, 0);
  const density = Math.min(1, sumKernel / sumWeights);

  return {
    density,
    nearest: nearest.map((n) => ({ name: n.name, dist: n.dist })),
  };
}

/** Add priority score and reason to each cell; optionally use resources */
export function addPriorityToCells(
  cells: GridCell[],
  eventsLast30: DeliveryEvent[],
  resources: ResourceLocation[]
): GridCell[] {
  const now = new Date();

  // Aggregate recent activity by cell (last 30d) — count-based
  const visitsByCell = new Map<string, number>();
  const lastServedByCell = new Map<string, Date>();
  for (const e of eventsLast30) {
    const key = getCellKey(e.lat, e.lng);
    visitsByCell.set(key, (visitsByCell.get(key) ?? 0) + 1);
    const d = new Date(e.timestamp);
    const existing = lastServedByCell.get(key);
    if (!existing || d > existing) lastServedByCell.set(key, d);
  }

  return cells.map((cell) => {
    const served30 = visitsByCell.get(cell.cell_id) ?? 0;
    const lastServed = lastServedByCell.get(cell.cell_id);
    const lastServedDays = lastServed
      ? Math.floor((now.getTime() - lastServed.getTime()) / (24 * 60 * 60 * 1000))
      : 999;

    const [clat, clng] = cellCenter(cell);

    // ---- MULTI-RESOURCE INFLUENCE (K-nearest with exponential decay) ----
    const { density, nearest } = multiResourceInfluence(clat, clng, resources);
    // higher density -> more/closer resources -> lower priority
    const resourcePenalty = -density; // ∈ [-1, 0]

    // ---- MAIN SCORE ----
    const needProxy = 1 / (1 + served30);                // high when few recent deliveries
    const recencyGap = Math.min(1, lastServedDays / 14); // high when not served recently
    const priority_score = W1 * needProxy + W2 * recencyGap + W3 * resourcePenalty;

    // // ---- Explainability fields ----
    // const reason: string[] = [];
    // if (served30 <= 5) reason.push("Low deliveries recently");
    // if (lastServedDays >= 7) reason.push(`Not served in ${lastServedDays} days`);
    // if (nearest.length) {
    //   const list = nearest.slice(0, 3)
    //     .map((n) => `${n.name} (${Math.round(n.dist)}m)`)
    //     .join(",\n");
    //   reason.push(`Nearby resources: ${list}`);
    // }

    return {
      ...cell,
      priority_score,
      served_meals_30d: served30, // kept for compatibility (represents recent deliveries)
      last_served_days: lastServedDays === 999 ? undefined : lastServedDays,
      nearest_resource: nearest[0]?.name,
      dist_to_resource_m: nearest[0] ? Math.round(nearest[0].dist) : undefined,
      // reason: reason.length ? reason : undefined,
    };
  });
}

/** Get top N priority cells (for side panel and map markers) */
export function getTopPriorityCells(cells: GridCell[], n: number): GridCell[] {
  return [...cells]
    .filter((c) => c.priority_score != null)
    .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0))
    .slice(0, n);
}

/** Top percentile for priority spotlight (only show this % of cells). */
export const PRIORITY_SPOTLIGHT_TOP_PERCENT = 65;

/**
 * Get cells in the top `topPercent` by priority_score (percentile-based).
 * Assigns normalizedPriority 0–1 within that set for quantile-style coloring.
 * Returns { cells, topPercentUsed } so the legend can show "top 15%".
 */
export function getTopPriorityPercentileCells(
  cells: GridCell[],
  topPercent: number = PRIORITY_SPOTLIGHT_TOP_PERCENT
): { cells: GridCell[]; topPercentUsed: number } {
  const withScore = cells.filter((c) => c.priority_score != null) as (GridCell & { priority_score: number })[];
  if (withScore.length === 0) return { cells: [], topPercentUsed: topPercent };
  withScore.sort((a, b) => b.priority_score - a.priority_score);
  const take = Math.max(1, Math.ceil((withScore.length * topPercent) / 100));
  const top = withScore.slice(0, take);
  const minS = Math.min(...top.map((c) => c.priority_score));
  const maxS = Math.max(...top.map((c) => c.priority_score));
  const range = maxS - minS || 1;
  const cellsWithNorm = top.map((c) => ({
    ...c,
    normalizedPriority: (c.priority_score - minS) / range,
  }));
  return { cells: cellsWithNorm, topPercentUsed: topPercent };
}

/**
 * Spotlight color: transparent → yellow → orange → red.
 * Low normalized score = nearly invisible; high = strong red.
 * Returns fill color (no alpha) and fillOpacity scaled by score.
 */
export function priorityColorSpotlight(normalizedScore: number): { color: string; fillOpacity: number } {
  const t = Math.max(0, Math.min(1, normalizedScore));
  // Hue: 0 = yellow (#fbbf24), 0.5 = orange (#f97316), 1 = red (#dc2626)
  let r: number, g: number, b: number;
  if (t < 0.5) {
    const u = t * 2; // 0..1
    r = Math.round(251 + u * (249 - 251));
    g = Math.round(191 + u * (115 - 191));
    b = Math.round(36 + u * (38 - 36));
  } else {
    const u = (t - 0.5) * 2; // 0..1
    r = Math.round(249 + u * (220 - 249));
    g = Math.round(115 + u * (38 - 115));
    b = Math.round(38);
  }
  const color = `rgb(${r},${g},${b})`;
  const fillOpacity = 0.12 + t * 0.78; // ~0.12 to ~0.9
  return { color, fillOpacity };
}

/** Interpolate color for coverage (intense red scale); power curve = more separation, brighter reds */
export function coverageColor(meals: number, maxMeals: number): string {
  if (maxMeals <= 0 || meals <= 0) return "#fef2f2";
  const t = Math.min(1, meals / maxMeals);
  const tAdj = Math.pow(t, 0.5);
  const r = Math.round(254 - tAdj * 15);
  const g = Math.round(242 - tAdj * 174);
  const b = Math.round(242 - tAdj * 174);
  return `rgb(${r},${g},${b})`;
}

/** Interpolate color for priority (legacy green–red; prefer priorityColorSpotlight for overlay) */
export function priorityColor(score: number): string {
  const t = Math.max(0, Math.min(1, score));
  const r = Math.round(34 + t * 221);
  const g = Math.round(197 - t * 197);
  const b = Math.round(44);
  return `rgb(${r},${g},${b})`;
}

/** Fetch Austin HSO resources from ArcGIS and convert to ResourceLocation[] */
export async function fetchHSOResources(): Promise<ResourceLocation[]> {
  // Build a FeatureLayer client (Esri‑Leaflet)
  const layer = (EL as any).featureLayer({ url: ARC_LAYER_URL });

  // Wrap esri-leaflet query() in a Promise so we can await it
  const featureCollection: { features: any[] } = await new Promise((resolve, reject) => {
    layer
      .query()
      .where("1=1")
      .returnGeometry(true)
      .outFields(["*"])
      .run((err: any, fc: any) => (err ? reject(err) : resolve(fc)));
  });

  const features = featureCollection?.features ?? [];

  // Map ArcGIS features → your ResourceLocation[]
  const resources: ResourceLocation[] = features
    .map((f: any, i: number) => {
      // GeoJSON Point: [lng, lat]
      const [lng, lat] = f?.geometry?.coordinates ?? [NaN, NaN];
      const p = f?.properties ?? {};

      // Try common field names; adjust after first console.log if needed
      const name =
        (p.Name ?? p.NAME ?? p.SiteName ?? p.Facility ?? p.Organization ?? p.Program ?? `Location ${i + 1}`) as string;

      const typeRaw = String(p.Type ?? p.Category ?? p.ServiceType ?? p.ProgramType ?? "").toLowerCase();
      const type: ResourceLocation["type"] =
        typeRaw.includes("shelter") ? "shelter" :
        typeRaw.includes("pantry") || typeRaw.includes("food") ? "pantry" :
        typeRaw.includes("outreach") ? "outreach" : "other";

      const hours = (p.Hours ?? p.OperatingHours) as string | undefined;
      const contact = (p.Phone ?? p.Contact ?? p.Website ?? p.Email) as string | undefined;

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

      return {
        id: Number(p.OBJECTID ?? p.ObjectID ?? i + 1),
        name,
        type,
        lat,
        lng,
        hours,
        contact_info: contact,
      } as ResourceLocation;
    })
    .filter(Boolean) as ResourceLocation[];

  // Uncomment once to inspect actual fields, then tweak mapping above if needed:
  // console.log("HSO sample properties:", features[0]?.properties);

  return resources;
}
