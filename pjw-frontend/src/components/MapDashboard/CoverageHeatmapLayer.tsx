import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import type { DeliveryEvent } from "@/data/mockDeliveryData";

interface CoverageHeatmapLayerProps {
  events: DeliveryEvent[];
}

/** Heatmap layer for delivery coverage (replaces hexbin in coverage mode) */
export default function CoverageHeatmapLayer({ events }: CoverageHeatmapLayerProps) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (events.length === 0) return;
    const points: [number, number, number][] = events.map((e) => [
      e.lat,
      e.lng,
      e.meals_delivered,
    ]);
    const maxWeight = Math.max(1, ...events.map((e) => e.meals_delivered));

    // leaflet.heat extends L; no built-in types
    // maxZoom: 10 keeps heat at full intensity when zoom >= 10 (no fade on zoom out)
    const heatLayer = (L as unknown as { heatLayer: (p: [number, number, number][], o?: object) => L.Layer })
      .heatLayer(points, {
        radius: 50,
        blur: 35,
        maxZoom: 10,
        max: maxWeight,
        minOpacity: 0.55,
        gradient: {
          0.15: "#fef3c7",
          0.4: "#fb923c",
          0.65: "#ea580c",
          0.85: "#dc2626",
          1.0: "#991b1b",
        },
      });
    heatLayer.addTo(map);
    layerRef.current = heatLayer;
    return () => {
      map.removeLayer(heatLayer);
      layerRef.current = null;
    };
  }, [map, events]);

  return null;
}
