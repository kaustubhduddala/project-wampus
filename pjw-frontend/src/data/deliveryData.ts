import { latLngToCell, polygonToCells, cellToBoundary, cellToLatLng } from 'h3-js';
import * as EL from 'esri-leaflet';

type ArcGisPrimitive = string | number | boolean | null | undefined;
type ArcGisProperties = Record<string, ArcGisPrimitive>;

interface ArcGisFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: ArcGisProperties;
}

interface ArcGisFeatureCollection {
  features?: ArcGisFeature[];
}

interface ArcGisQuery {
  where(query: string): ArcGisQuery;
  returnGeometry(includeGeometry: boolean): ArcGisQuery;
  fields(fields: string[]): ArcGisQuery;
  run(callback: (error: unknown, collection: ArcGisFeatureCollection) => void): void;
}

interface ArcGisFeatureLayer {
  query(): ArcGisQuery;
}

interface EsriLeafletApi {
  featureLayer(options: { url: string }): ArcGisFeatureLayer;
}

const ARC_LAYER_URL =
  'https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/Austin_HSO_Homeless_Resources_Finder/FeatureServer/2';

export interface DeliveryEvent {
  id: string | number;
  timestamp: string;
  lat: number;
  lng: number;
  notes?: string;
}

export interface ResourceLocation {
  id: number;
  name: string;
  type: 'shelter' | 'pantry' | 'outreach' | 'other';
  lat: number;
  lng: number;
  hours?: string;
  contact_info?: string;
}

export interface GridCell {
  cell_id: string;
  bounds: [[number, number], [number, number]];
  polygon: [number, number][];
  meals_sum: number;
  visit_count: number;
  last_served: string | null;
  priority_score?: number;
  served_meals_30d?: number;
  last_served_days?: number;
  nearest_resource?: string;
  dist_to_resource_m?: number;
  reason?: string[];
  normalizedPriority?: number;
}

const WEST_CAMPUS_BOUNDS = {
  south: 30.278,
  north: 30.298,
  west: -97.755,
  east: -97.725,
};

const H3_RES = 10;

export type TimeFilterKey = '7' | '30' | '90' | 'all';

export function getFilterStartDate(key: TimeFilterKey): Date | null {
  const now = new Date();
  if (key === 'all') return null;

  const d = new Date(now);
  if (key === '7') d.setDate(d.getDate() - 7);
  else if (key === '30') d.setDate(d.getDate() - 30);
  else if (key === '90') d.setDate(d.getDate() - 90);
  return d;
}

export function filterEventsByTime(events: DeliveryEvent[], key: TimeFilterKey): DeliveryEvent[] {
  const start = getFilterStartDate(key);
  if (!start) return [...events];
  return events.filter((e) => new Date(e.timestamp) >= start);
}

function getCellKey(lat: number, lng: number): string {
  return latLngToCell(lat, lng, H3_RES);
}

export function getEventCellId(event: DeliveryEvent): string {
  return latLngToCell(event.lat, event.lng, H3_RES);
}

function distMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

function westCampusRing(): [number, number][] {
  const { south, north, west, east } = WEST_CAMPUS_BOUNDS;
  return [
    [south, west],
    [north, west],
    [north, east],
    [south, east],
    [south, west],
  ];
}

function polygonBounds(polygon: [number, number][]): [[number, number], [number, number]] {
  const lats = polygon.map(([lat]) => lat);
  const lngs = polygon.map(([, lng]) => lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

export function buildCoverageGrid(events: DeliveryEvent[]): GridCell[] {
  const byCell = new Map<string, { visits: number; lastDate: Date | null }>();

  for (const e of events) {
    if (
      e.lat < WEST_CAMPUS_BOUNDS.south ||
      e.lat > WEST_CAMPUS_BOUNDS.north ||
      e.lng < WEST_CAMPUS_BOUNDS.west ||
      e.lng > WEST_CAMPUS_BOUNDS.east
    ) {
      continue;
    }

    const key = getCellKey(e.lat, e.lng);
    const date = new Date(e.timestamp);
    const existing = byCell.get(key);
    if (!existing) {
      byCell.set(key, { visits: 1, lastDate: date });
    } else {
      existing.visits += 1;
      if (existing.lastDate == null || date > existing.lastDate) {
        existing.lastDate = date;
      }
    }
  }

  const ring = westCampusRing();
  const hexIds = polygonToCells(ring, H3_RES);

  return hexIds.map((cellId) => {
    const boundary = cellToBoundary(cellId);
    const polygon: [number, number][] = [
      ...boundary.map(([lat, lng]) => [lat, lng] as [number, number]),
      boundary[0],
    ];
    const bounds = polygonBounds(polygon);
    const data = byCell.get(cellId);
    const visits = data?.visits ?? 0;

    return {
      cell_id: cellId,
      bounds,
      polygon,
      meals_sum: visits,
      visit_count: visits,
      last_served: data?.lastDate ? data.lastDate.toISOString() : null,
    };
  });
}

const W1 = 0.5;
const W2 = 0.3;
const W3 = 0.2;
const K_NEAREST_RESOURCES = 3;
const RESOURCE_DECAY_M = 300;

const RESOURCE_TYPE_WEIGHT: Record<ResourceLocation['type'], number> = {
  pantry: 1.0,
  shelter: 0.9,
  outreach: 0.6,
  other: 0.5,
};

function multiResourceInfluence(
  lat: number,
  lng: number,
  resources: ResourceLocation[],
  k: number = K_NEAREST_RESOURCES,
  lambdaM: number = RESOURCE_DECAY_M
): { density: number; nearest: { name: string; dist: number }[] } {
  if (!resources.length) return { density: 0, nearest: [] };

  const scored = resources.map((r) => {
    const d = distMeters(lat, lng, r.lat, r.lng);
    const wType = RESOURCE_TYPE_WEIGHT[r.type] ?? 0.5;
    const kVal = wType * Math.exp(-d / lambdaM);
    return { name: r.name, dist: d, wType, kVal };
  });

  scored.sort((a, b) => a.dist - b.dist);
  const nearest = scored.slice(0, Math.max(1, k));

  const sumWeights = nearest.reduce((s, r) => s + r.wType, 0) || 1;
  const sumKernel = nearest.reduce((s, r) => s + r.kVal, 0);
  const density = Math.min(1, sumKernel / sumWeights);

  return {
    density,
    nearest: nearest.map((n) => ({ name: n.name, dist: n.dist })),
  };
}

export function addPriorityToCells(
  cells: GridCell[],
  eventsLast30: DeliveryEvent[],
  resources: ResourceLocation[]
): GridCell[] {
  const now = new Date();
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
    const { density, nearest } = multiResourceInfluence(clat, clng, resources);
    const resourcePenalty = -density;

    const needProxy = 1 / (1 + served30);
    const recencyGap = Math.min(1, lastServedDays / 14);
    const priority_score = W1 * needProxy + W2 * recencyGap + W3 * resourcePenalty;

    return {
      ...cell,
      priority_score,
      served_meals_30d: served30,
      last_served_days: lastServedDays === 999 ? undefined : lastServedDays,
      nearest_resource: nearest[0]?.name,
      dist_to_resource_m: nearest[0] ? Math.round(nearest[0].dist) : undefined,
    };
  });
}

export function getTopPriorityCells(cells: GridCell[], n: number): GridCell[] {
  return [...cells]
    .filter((c) => c.priority_score != null)
    .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0))
    .slice(0, n);
}

export const PRIORITY_SPOTLIGHT_TOP_PERCENT = 65;

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

export function priorityColorSpotlight(normalizedScore: number): { color: string; fillOpacity: number } {
  const t = Math.max(0, Math.min(1, normalizedScore));

  let r;
  let g;
  let b;

  if (t < 0.5) {
    const u = t * 2;
    r = Math.round(251 + u * (249 - 251));
    g = Math.round(191 + u * (115 - 191));
    b = Math.round(36 + u * (38 - 36));
  } else {
    const u = (t - 0.5) * 2;
    r = Math.round(249 + u * (220 - 249));
    g = Math.round(115 + u * (38 - 115));
    b = Math.round(38);
  }

  const color = `rgb(${r},${g},${b})`;
  const fillOpacity = 0.12 + t * 0.78;
  return { color, fillOpacity };
}

export function coverageColor(meals: number, maxMeals: number): string {
  if (maxMeals <= 0 || meals <= 0) return '#fef2f2';
  const t = Math.min(1, meals / maxMeals);
  const tAdj = Math.pow(t, 0.5);
  const r = Math.round(254 - tAdj * 15);
  const g = Math.round(242 - tAdj * 174);
  const b = Math.round(242 - tAdj * 174);
  return `rgb(${r},${g},${b})`;
}

export function priorityColor(score: number): string {
  const t = Math.max(0, Math.min(1, score));
  const r = Math.round(34 + t * 221);
  const g = Math.round(197 - t * 197);
  const b = Math.round(44);
  return `rgb(${r},${g},${b})`;
}

export async function fetchHSOResources(): Promise<ResourceLocation[]> {
  const esriLeaflet = EL as unknown as EsriLeafletApi;
  const layer = esriLeaflet.featureLayer({ url: ARC_LAYER_URL });

  const featureCollection = await new Promise<ArcGisFeatureCollection>((resolve, reject) => {
    layer
      .query()
      .where('1=1')
      .returnGeometry(true)
      .fields(['*'])
      .run((error, collection) => (error ? reject(error) : resolve(collection)));
  });

  const features = featureCollection?.features ?? [];

  const resources: ResourceLocation[] = features
    .map<ResourceLocation | null>((feature, i: number) => {
      const f = feature;
      const [lng, lat] = f?.geometry?.coordinates ?? [NaN, NaN];
      const p = f?.properties ?? {};

      const rawName = p.Name ?? p.NAME ?? p.SiteName ?? p.Facility ?? p.Organization ?? p.Program;
      const name = typeof rawName === 'string' && rawName.trim() ? rawName : `Location ${i + 1}`;

      const typeRaw = String(p.Type ?? p.Category ?? p.ServiceType ?? p.ProgramType ?? '').toLowerCase();
      const type: ResourceLocation['type'] =
        typeRaw.includes('shelter')
          ? 'shelter'
          : typeRaw.includes('pantry') || typeRaw.includes('food')
            ? 'pantry'
            : typeRaw.includes('outreach')
              ? 'outreach'
              : 'other';

              const rawHours = p.Hours ?? p.OperatingHours;
              const rawContact = p.Phone ?? p.Contact ?? p.Website ?? p.Email;
              const hours = typeof rawHours === 'string' ? rawHours : undefined;
              const contact = typeof rawContact === 'string' ? rawContact : undefined;

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

      return {
        id: Number(p.OBJECTID ?? p.ObjectID ?? i + 1),
        name,
        type,
        lat,
        lng,
        hours,
        contact_info: contact,
      };
    })
    .filter((resource): resource is ResourceLocation => resource !== null);

  return resources;
}
