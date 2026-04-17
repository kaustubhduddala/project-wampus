import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import type { Map as LMap } from "leaflet";

interface MapControllerProps {
  onMapReady: (map: LMap | null) => void;
  onZoomChange?: (zoom: number) => void;
}

export default function MapController({ onMapReady, onZoomChange }: MapControllerProps) {
  const map = useMap();
  useMapEvents({
    zoomend: () => onZoomChange?.(map.getZoom()),
  });
  useEffect(() => {
    onMapReady(map);
    onZoomChange?.(map.getZoom());
    return () => onMapReady(null);
  }, [map, onMapReady, onZoomChange]);
  return null;
}
