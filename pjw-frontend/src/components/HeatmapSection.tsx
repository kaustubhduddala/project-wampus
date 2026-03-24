import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { MapPin, Grid3X3, CircleDot, Building2, Zap, List } from "lucide-react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import {
  MOCK_DELIVERY_EVENTS,
  MOCK_RESOURCES,
  filterEventsByTime,
  buildCoverageGrid,
  addPriorityToCells,
  getTopPriorityCells,
  getTopPriorityPercentileCells,
  PRIORITY_SPOTLIGHT_TOP_PERCENT,
  type TimeFilterKey,
  type GridCell,
  type ResourceLocation,
  fetchHSOResources,
} from "@/data/mockDeliveryData";
import MapController from "@/components/MapDashboard/MapController";
import CoverageLayer from "@/components/MapDashboard/CoverageLayer";
import CoverageHeatmapLayer from "@/components/MapDashboard/CoverageHeatmapLayer";
import EventLayer from "@/components/MapDashboard/EventLayer";
import ResourceLayer from "@/components/MapDashboard/ResourceLayer";
import PriorityMarkersLayer from "@/components/MapDashboard/PriorityMarkersLayer";
import { Button } from "@/components/ui/button";

const WEST_CAMPUS_CENTER: [number, number] = [30.288, -97.74];
const ZOOM_THRESHOLD = 18;

type LayerMode = "coverage" | "events" | "priority";

export default function HeatmapSection() {
  const mapRef = useRef<L.Map | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilterKey>("all");
  const [layerMode, setLayerMode] = useState<LayerMode>("coverage");
  const [autoMode, setAutoMode] = useState(true);
  const [showResources, setShowResources] = useState(false);
  const [clusterEvents, setClusterEvents] = useState(true);
  const [zoom, setZoom] = useState(12);
  // Live resources from HSO Feature Service (fallback to mock on error)
  const [resources, setResources] = useState<ResourceLocation[] | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchHSOResources()
      .then((data) => { if (mounted) setResources(data); })
      .catch((e) => {
        console.error("HSO fetch failed; using MOCK_RESOURCES", e);
        if (mounted) setResources(MOCK_RESOURCES);
      });
    return () => { mounted = false; };
  }, []);

  const filteredEvents = useMemo(
    () => filterEventsByTime(MOCK_DELIVERY_EVENTS, timeFilter),
    [timeFilter]
  );

  const eventsLast30 = useMemo(
    () => filterEventsByTime(MOCK_DELIVERY_EVENTS, "30"),
    []
  );

  const coverageCells = useMemo(
    () => buildCoverageGrid(filteredEvents),
    [filteredEvents]
  );

  const cellsWithPriority = useMemo(
    () => addPriorityToCells(coverageCells, eventsLast30, resources ?? MOCK_RESOURCES),
    [coverageCells, eventsLast30, resources]
  );

  const maxMeals = useMemo(
    () => Math.max(1, ...coverageCells.map((c) => c.meals_sum)),
    [coverageCells]
  );

  const topPriority = useMemo(
    () => getTopPriorityCells(cellsWithPriority, 3),
    [cellsWithPriority]
  );

  const { cells: prioritySpotlightCells, topPercentUsed } = useMemo(
    () => getTopPriorityPercentileCells(cellsWithPriority, PRIORITY_SPOTLIGHT_TOP_PERCENT),
    [cellsWithPriority]
  );

  const topFiveForMarkers = useMemo(
    () => getTopPriorityCells(cellsWithPriority, 3),
    [cellsWithPriority]
  );

  const impactSummary = useMemo(() => {
    const totalDeliveries = filteredEvents.length; // each event counts as one delivery
    const deliveryStops = filteredEvents.length;
    const daysActive = new Set(
      filteredEvents.map((e) => new Date(e.timestamp).toDateString())
    ).size;
    return { totalDeliveries, deliveryStops, daysActive };
  }, [filteredEvents]);

  const effectiveLayer = useMemo((): LayerMode => {
    if (layerMode === "events") return "events";
    if (layerMode === "priority") return "priority";
    if (!autoMode) return layerMode;
    return zoom < ZOOM_THRESHOLD ? "coverage" : "events";
  }, [autoMode, layerMode, zoom]);

  const onMapReady = useCallback((map: L.Map | null) => {
    mapRef.current = map;
  }, []);

  const flyToBounds = useCallback((bounds: L.LatLngBoundsExpression) => {
    mapRef.current?.flyToBounds(bounds, { maxZoom: ZOOM_THRESHOLD, duration: 0.5 });
  }, []);

  const handleCellClick = useCallback(
    (bounds: L.LatLngBoundsExpression, _cellId?: string) => {
      flyToBounds(bounds);
      if (autoMode) setZoom(ZOOM_THRESHOLD);
    },
    [flyToBounds, autoMode]
  );

  const priorityLabel = (score: number) => {
    if (score >= 0.7) return "High";
    if (score >= 0.4) return "Medium";
    return "Low";
  };

  return (
    <div className="bg-[#F5F5F5] p-8 neo-brutal-border neo-brutal-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#22C55E] neo-brutal-border flex items-center justify-center">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black">Delivery HEATMAP</h2>
          <p className="text-sm font-bold">Our delivery zones across Austin</p>
        </div>
      </div>

      {/* Impact summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white neo-brutal-border neo-brutal-shadow-sm p-6 text-center">
          <p className="text-4xl md:text-5xl font-black text-[#b91c1c] mb-1">
            {impactSummary.totalDeliveries.toLocaleString()}
          </p>
          <p className="text-sm font-bold text-gray-700">Total deliveries</p>
        </div>
        <div className="bg-white neo-brutal-border neo-brutal-shadow-sm p-6 text-center">
          <p className="text-4xl md:text-5xl font-black text-[#b91c1c] mb-1">
            {impactSummary.deliveryStops.toLocaleString()}
          </p>
          <p className="text-sm font-bold text-gray-700">Delivery stops</p>
        </div>
        <div className="bg-white neo-brutal-border neo-brutal-shadow-sm p-6 text-center">
          <p className="text-4xl md:text-5xl font-black text-[#b91c1c] mb-1">
            {impactSummary.daysActive}
          </p>
          <p className="text-sm font-bold text-gray-700">Days active</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white neo-brutal-border-thin">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm">TIME:</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilterKey)}
            className="neo-brutal-border px-3 py-2 font-bold bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-black text-sm">LAYER:</span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className={`neo-button font-bold ${layerMode === "coverage" ? "!bg-[#22C55E] !text-white border-2 border-black" : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-400"}`}
              onClick={() => setLayerMode("coverage")}
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              Coverage
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`neo-button font-bold ${layerMode === "events" ? "!bg-[#22C55E] !text-white border-2 border-black" : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-400"}`}
              onClick={() => setLayerMode("events")}
            >
              <CircleDot className="w-4 h-4 mr-1" />
              Events
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`neo-button font-bold ${layerMode === "priority" ? "!bg-[#22C55E] !text-white border-2 border-black" : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-400"}`}
              onClick={() => setLayerMode("priority")}
            >
              <Zap className="w-4 h-4 mr-1" />
              Priority
            </Button>
          </div>
        </div>
        <Button
          size="sm"
          variant={showResources ? "default" : "ghost"}
          className="neo-button font-bold"
          onClick={() => setShowResources((s) => !s)}
        >
          <Building2 className="w-4 h-4 mr-1" />
          Resources {showResources ? "ON" : "OFF"}
        </Button>
        {layerMode === "coverage" ? (
          <label className="flex items-center gap-2 font-bold cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={autoMode}
              onChange={(e) => setAutoMode(e.target.checked)}
              className="w-4 h-4"
            />
            Auto (Coverage when zoomed out, Events when zoomed in)
          </label>
        ) : null}
        {layerMode === "events" ? (
          <label className="flex items-center gap-2 font-bold cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={clusterEvents}
              onChange={(e) => setClusterEvents(e.target.checked)}
              className="w-4 h-4"
            />
            Cluster events
          </label>
        ) : null}
      </div>

      <div className="grid md:grid-cols-2 gap-6 min-h-[500px]">
        {/* Map */}
        <div className="bg-white neo-brutal-border neo-brutal-shadow-sm overflow-hidden flex flex-col min-h-[400px] relative">
          <div className="flex-1 min-h[400px] w-full relative overflow-hidden">
            <MapContainer
              center={WEST_CAMPUS_CENTER}
              zoom={14}
              className="h-full w-full"
              scrollWheelZoom
              zoomControl={false}
            >
              <MapController onMapReady={onMapReady} onZoomChange={setZoom} />
              <TileLayer
                attribution='&copy; OpenStreetMap &copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={19}
              />
              {showResources && <ResourceLayer resources={resources ?? MOCK_RESOURCES} />}
              {effectiveLayer === "coverage" && (
                <CoverageHeatmapLayer events={filteredEvents} />
              )}
              {effectiveLayer === "events" && (
                <EventLayer
                  events={filteredEvents}
                  cluster={layerMode === "coverage" ? true : clusterEvents}
                />
              )}
              {effectiveLayer === "priority" && (
                <>
                  <CoverageLayer
                    cells={prioritySpotlightCells}
                    mode="priority"
                    maxMeals={maxMeals}
                    onCellClick={handleCellClick}
                  />
                  <PriorityMarkersLayer
                    cells={topFiveForMarkers}
                    onCellClick={(bounds) => {
                      flyToBounds(bounds);
                      if (autoMode) setZoom(ZOOM_THRESHOLD);
                    }}
                  />
                </>
              )}
            </MapContainer>
          </div>
          <div className="flex-shrink-0 p-3 bg-[#F5F5F5] neo-brutal-border-thin border-t flex flex-wrap gap-4 justify-center text-xs font-bold">
            {effectiveLayer === "coverage" && (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: "#fef3c7" }} /> Low
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: "#fb923c" }} /> Medium
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: "#dc2626" }} /> High
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: "#991b1b" }} /> Peak
                </span>
              </>
            )}
            {effectiveLayer === "priority" && (
              <>
                <span className="font-bold">
                  Showing top {topPercentUsed}% priority zones
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm opacity-60" style={{ backgroundColor: "#fbbf24" }} /> Low (in set)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#f97316" }} /> Mid
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#dc2626" }} /> High
                </span>
                <span className="text-gray-600">#1–#5 = where to go next</span>
              </>
            )}
            {showResources && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-500 border border-black" /> Resource
              </span>
            )}
          </div>
        </div>

        {/* Priority panel */}
        <div className="space-y-4">
          <div className="bg-white neo-brutal-border neo-brutal-shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <List className="w-5 h-5 text-[#22C55E]" />
              <h3 className="font-black text-xl">TOP PRIORITY ZONES</h3>
            </div>
            <p className="text-xs font-bold text-gray-600 mb-4">
              Underserved by our delivery history. Click to zoom on map.
            </p>
            <div className="space-y-3">
              {topPriority.map((cell: GridCell) => (
                <button
                  key={cell.cell_id}
                  type="button"
                  onClick={() => flyToBounds(cell.bounds)}
                  className="w-full text-left p-3 bg-[#F5F5F5] neo-brutal-border-thin hover:bg-[#e5e5e5] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black">
                      {priorityLabel(cell.priority_score ?? 0)}
                    </span>
                    <span className="text-[#22C55E] font-black text-sm">
                      {(cell.priority_score ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs font-bold space-y-0.5">
                    {cell.reason?.slice(0, 2).map((r, i) => (
                      <div key={i}>• {r}</div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
``