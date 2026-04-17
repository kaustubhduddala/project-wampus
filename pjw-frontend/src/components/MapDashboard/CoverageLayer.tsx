import React, { useCallback, useState } from "react";
import { Polygon, Tooltip, Marker } from "react-leaflet";
import type { GridCell } from "@/data/mockDeliveryData";
import { coverageColor, priorityColorSpotlight } from "@/data/mockDeliveryData";
import L from "leaflet";

interface CoverageLayerProps {
  cells: GridCell[];
  mode: "coverage" | "priority";
  maxMeals: number;
  onCellClick?: (bounds: L.LatLngBoundsExpression, cellId: string) => void;
}

function hexCenter(cell: GridCell): [number, number] {
  const [[south, west], [north, east]] = cell.bounds;
  return [(south + north) / 2, (west + east) / 2];
}

export default function CoverageLayer({
  cells,
  mode,
  maxMeals,
  onCellClick,
}: CoverageLayerProps) {
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);

  const handleClick = useCallback(
    (cell: GridCell) => {
      if (!onCellClick) return;
      const [[south, west], [north, east]] = cell.bounds;
      const bounds: L.LatLngBoundsExpression = [
        [south, west],
        [north, east],
      ];
      onCellClick(bounds, cell.cell_id);
    },
    [onCellClick]
  );

  return (
    <>
      {cells.map((cell) => {
        const isPriority = mode === "priority";
        const fillColor =
          mode === "coverage"
            ? coverageColor(cell.meals_sum, maxMeals)
            : cell.normalizedPriority != null
              ? priorityColorSpotlight(cell.normalizedPriority).color
              : "#fef2f2";
        const latLngs: L.LatLngExpression[] = cell.polygon.map(([lat, lng]) => [
          lat,
          lng,
        ] as L.LatLngExpression);
        const isZeroMeals = mode === "coverage" && cell.meals_sum === 0;
        const fillOpacity =
          isPriority && cell.normalizedPriority != null
            ? priorityColorSpotlight(cell.normalizedPriority).fillOpacity
            : isZeroMeals
              ? 0.12
              : 0.72;
        const showBorder = isPriority ? hoveredCellId === cell.cell_id : !isZeroMeals;
        const stroke = showBorder ? "rgba(0,0,0,0.5)" : "transparent";
        const strokeWeight = showBorder ? 2 : 0;
        const center = hexCenter(cell);
        const mealLabelIcon =
          mode === "coverage" && cell.meals_sum !== 0
            ? L.divIcon({
                className: "hex-meal-label",
                html: `<div style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 24px;
                  height: 24px;
                  margin: 0;
                  padding: 0;
                "><span style="
                  font-weight: 800;
                  font-size: 11px;
                  color: rgba(255,255,255,0.95);
                  text-shadow: 0 0 2px #000, 0 1px 3px #000;
                  pointer-events: none;
                  user-select: none;
                  line-height: 1;
                ">${cell.meals_sum}</span></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })
            : null;

        return (
          <React.Fragment key={cell.cell_id}>
          <Polygon
            positions={latLngs}
            pathOptions={{
              color: stroke,
              weight: strokeWeight,
              fillColor,
              fillOpacity,
            }}
            eventHandlers={{
              click: () => handleClick(cell),
              mouseover: () => setHoveredCellId(cell.cell_id),
              mouseout: () => setHoveredCellId(null),
            }}
          >
            <Tooltip permanent={false} direction="top">
              {mode === "coverage" ? (
                <>
                  <div className="font-black">Meals: {cell.meals_sum}</div>
                  <div className="font-bold text-sm">Visits: {cell.visit_count}</div>
                  {cell.last_served && (
                    <div className="text-xs">
                      Last: {new Date(cell.last_served).toLocaleDateString()}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="font-black">
                    Priority: {(cell.priority_score ?? 0).toFixed(2)}
                  </div>
                  {cell.reason?.map((r, i) => (
                    <div key={i} className="text-xs">
                      • {r}
                    </div>
                  ))}
                </>
              )}
            </Tooltip>
          </Polygon>
          {mealLabelIcon && (
            <Marker
              position={center}
              icon={mealLabelIcon}
              zIndexOffset={100}
              eventHandlers={{ click: () => handleClick(cell) }}
            />
          )}
          </React.Fragment>
        );
      })}
    </>
  );
}
