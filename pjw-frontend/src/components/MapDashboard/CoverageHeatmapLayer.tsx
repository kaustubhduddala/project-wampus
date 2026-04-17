import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import type { DeliveryEvent } from "@/data/deliveryData";

interface CoverageHeatmapLayerProps {
  events: DeliveryEvent[];
}

/** Heatmap layer for delivery coverage (replaces hexbin in coverage mode) */
export default function CoverageHeatmapLayer({ events }: CoverageHeatmapLayerProps) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (events.length === 0) return;
    // Weight each event equally (1) now that meals_delivered has been removed
    const points: [number, number, number][] = events.map((e) => [
      e.lat,
      e.lng,
      1,
    ]);
    const maxWeight = 1;

    // leaflet.heat extends L; no built-in types
    // maxZoom: 10 keeps heat at full intensity when zoom >= 10 (no fade on zoom out)
    const heatLayer = (L as unknown as { heatLayer: (p: [number, number, number][], o?: object) => L.Layer })
      .heatLayer(points, {
        radius: 28,
        blur: 20,
        maxZoom: 10,
        max: Math.max(1, maxWeight * 1.5),
        minOpacity: 0.25,
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