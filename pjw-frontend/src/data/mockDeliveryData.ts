/**
 * Mock delivery events and resources for Map Dashboard (no API).
 * Design: Project Wampus Map + Heatmap/Hexbin MVP — client-side only.
 */

import { latLngToCell, polygonToCells, cellToBoundary, cellToLatLng } from "h3-js";

export interface DeliveryEvent {
  id: number;
  timestamp: string; // ISO UTC
  lat: number;
  lng: number;
  meals_delivered: number;
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
  meals_sum: number;
  visit_count: number;
  last_served: string | null; // ISO
  // Priority-only
  priority_score?: number;
  served_meals_30d?: number;
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

/** Mock delivery events spread over last 90 days */
export const MOCK_DELIVERY_EVENTS: DeliveryEvent[] = [
  { id: 1, timestamp: "2026-02-05T14:00:00Z", lat: 30.286, lng: -97.742, meals_delivered: 12, notes: "Near Guad and 24th" },
  { id: 2, timestamp: "2026-02-04T18:30:00Z", lat: 30.284, lng: -97.738, meals_delivered: 8 },
  { id: 3, timestamp: "2026-02-03T12:00:00Z", lat: 30.287, lng: -97.745, meals_delivered: 15 },
  { id: 4, timestamp: "2026-02-01T17:00:00Z", lat: 30.282, lng: -97.741, meals_delivered: 10 },
  { id: 5, timestamp: "2026-01-30T11:00:00Z", lat: 30.286, lng: -97.742, meals_delivered: 14 },
  { id: 6, timestamp: "2026-01-28T16:00:00Z", lat: 30.290, lng: -97.735, meals_delivered: 6 },
  { id: 7, timestamp: "2026-01-25T13:00:00Z", lat: 30.281, lng: -97.748, meals_delivered: 9 },
  { id: 8, timestamp: "2026-01-22T19:00:00Z", lat: 30.288, lng: -97.740, meals_delivered: 11 },
  { id: 9, timestamp: "2026-01-18T14:00:00Z", lat: 30.285, lng: -97.743, meals_delivered: 7 },
  { id: 10, timestamp: "2026-01-15T10:00:00Z", lat: 30.279, lng: -97.739, meals_delivered: 13 },
  { id: 11, timestamp: "2026-01-10T15:00:00Z", lat: 30.292, lng: -97.737, meals_delivered: 5 },
  { id: 12, timestamp: "2026-01-05T12:00:00Z", lat: 30.283, lng: -97.746, meals_delivered: 8 },
  { id: 13, timestamp: "2025-12-28T17:00:00Z", lat: 30.287, lng: -97.741, meals_delivered: 10 },
  { id: 14, timestamp: "2025-12-20T11:00:00Z", lat: 30.284, lng: -97.744, meals_delivered: 9 },
  { id: 15, timestamp: "2025-12-12T16:00:00Z", lat: 30.289, lng: -97.738, meals_delivered: 6 },
  { id: 16, timestamp: "2025-12-05T14:00:00Z", lat: 30.281, lng: -97.742, meals_delivered: 11 },
  { id: 17, timestamp: "2025-11-28T13:00:00Z", lat: 30.286, lng: -97.739, meals_delivered: 7 },
  { id: 18, timestamp: "2025-11-20T18:00:00Z", lat: 30.290, lng: -97.736, meals_delivered: 4 },
  { id: 19, timestamp: "2025-11-10T10:00:00Z", lat: 30.278, lng: -97.747, meals_delivered: 12 },
  { id: 20, timestamp: "2025-11-01T15:00:00Z", lat: 30.285, lng: -97.740, meals_delivered: 8 },
];

/** Mock resource locations (shelters, pantries) */
export const MOCK_RESOURCES: ResourceLocation[] = [
  { id: 1, name: "Caritas of Austin", type: "shelter", lat: 30.2713, lng: -97.7432 },
  { id: 2, name: "Central Texas Food Bank", type: "pantry", lat: 30.2591, lng: -97.7214 },
  { id: 3, name: "Front Steps", type: "shelter", lat: 30.2695, lng: -97.7388 },
  { id: 4, name: "Trinity Center", type: "outreach", lat: 30.2682, lng: -97.7415 },
  { id: 5, name: "Sunrise Community Church Pantry", type: "pantry", lat: 30.2821, lng: -97.7321 },
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
    { meals: number; visits: number; lastDate: Date | null }
  >();

  for (const e of events) {
    if (
      e.lat < WEST_CAMPUS_BOUNDS.south ||
      e.lat > WEST_CAMPUS_BOUNDS.north ||
      e.lng < WEST_CAMPUS_BOUNDS.west ||
      e.lng > WEST_CAMPUS_BOUNDS.east
    )
      continue;
    const key = getCellKey(e.lat, e.lng);
    const date = new Date(e.timestamp);
    const existing = byCell.get(key);
    if (!existing) {
      byCell.set(key, { meals: e.meals_delivered, visits: 1, lastDate: date });
    } else {
      existing.meals += e.meals_delivered;
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
    return {
      cell_id: cellId,
      bounds,
      polygon,
      meals_sum: data?.meals ?? 0,
      visit_count: data?.visits ?? 0,
      last_served: data?.lastDate ? data.lastDate.toISOString() : null,
    };
  });

  return cells;
}

/** Priority weights (explainable MVP) */
const W1 = 0.5;
const W2 = 0.4;
const W3 = 0.1;

/** Add priority score and reason to each cell; optionally use resources */
export function addPriorityToCells(
  cells: GridCell[],
  eventsLast30: DeliveryEvent[],
  resources: ResourceLocation[] = MOCK_RESOURCES
): GridCell[] {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const mealsByCell = new Map<string, number>();
  const lastServedByCell = new Map<string, Date>();
  for (const e of eventsLast30) {
    const key = getCellKey(e.lat, e.lng);
    mealsByCell.set(key, (mealsByCell.get(key) ?? 0) + e.meals_delivered);
    const d = new Date(e.timestamp);
    const existing = lastServedByCell.get(key);
    if (!existing || d > existing) lastServedByCell.set(key, d);
  }

  return cells.map((cell) => {
    const served30 = mealsByCell.get(cell.cell_id) ?? 0;
    const lastServed = lastServedByCell.get(cell.cell_id);
    const lastServedDays = lastServed
      ? Math.floor((now.getTime() - lastServed.getTime()) / (24 * 60 * 60 * 1000))
      : 999;

    const [clat, clng] = cellCenter(cell);
    let minDist = Infinity;
    let nearestName = "";
    for (const r of resources) {
      const d = distMeters(clat, clng, r.lat, r.lng);
      if (d < minDist) {
        minDist = d;
        nearestName = r.name;
      }
    }
    const distToResource = minDist === Infinity ? 500 : minDist;
    const resourceBoost = -Math.exp(-distToResource / 300);

    const needProxy = 1 / (1 + served30);
    const recencyGap = Math.min(1, lastServedDays / 14);
    const priority_score = W1 * needProxy + W2 * recencyGap + W3 * resourceBoost;

    const reason: string[] = [];
    if (served30 <= 5) reason.push("Low meals delivered recently");
    if (lastServedDays >= 7) reason.push(`Not served in ${lastServedDays} days`);
    if (nearestName) reason.push(`Near resource: ${nearestName} (${Math.round(distToResource)}m)`);

    return {
      ...cell,
      priority_score,
      served_meals_30d: served30,
      last_served_days: lastServedDays === 999 ? undefined : lastServedDays,
      nearest_resource: nearestName || undefined,
      dist_to_resource_m: nearestName ? Math.round(distToResource) : undefined,
      reason: reason.length ? reason : undefined,
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
export const PRIORITY_SPOTLIGHT_TOP_PERCENT = 15;

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
