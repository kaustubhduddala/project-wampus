import React, { useCallback } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import type { GridCell } from "@/data/mockDeliveryData";

function cellCenter(cell: GridCell): [number, number] {
  const [[south, west], [north, east]] = cell.bounds;
  return [(south + north) / 2, (west + east) / 2];
}

interface PriorityMarkersLayerProps {
  /** Top N priority cells (e.g. top 5) to show as #1–#N pins */
  cells: GridCell[];
  onCellClick?: (bounds: L.LatLngBoundsExpression) => void;
}

export default function PriorityMarkersLayer({
  cells,
  onCellClick,
}: PriorityMarkersLayerProps) {
  const handleClick = useCallback(
    (cell: GridCell) => {
      if (!onCellClick) return;
      const [[south, west], [north, east]] = cell.bounds;
      onCellClick([
        [south, west],
        [north, east],
      ]);
    },
    [onCellClick]
  );

  return (
    <>
      {cells.map((cell, index) => {
        const center = cellCenter(cell);
        const rank = index + 1;
        const icon = L.divIcon({
          className: "priority-rank-marker",
          html: `<div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #dc2626;
            color: white;
            font-weight: 800;
            font-size: 12px;
            border: 2px solid #000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            pointer-events: auto;
          ">#${rank}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        return (
          <Marker
            key={cell.cell_id}
            position={center}
            icon={icon}
            zIndexOffset={500}
            eventHandlers={{ click: () => handleClick(cell) }}
          />
        );
      })}
    </>
  );
}
