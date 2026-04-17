import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { ResourceLocation } from "@/data/mockDeliveryData";

const resourceIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    background-color: #3b82f6;
    width: 20px;
    height: 20px;
    border: 2px solid #000;
    border-radius: 4px;
    box-shadow: 2px 2px 0px #000;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  tooltipAnchor: [0, -20],
});

interface ResourceLayerProps {
  resources: ResourceLocation[];
}

const typeLabel: Record<ResourceLocation["type"], string> = {
  shelter: "Shelter",
  pantry: "Pantry",
  outreach: "Outreach",
  other: "Resource",
};

export default function ResourceLayer({ resources }: ResourceLayerProps) {
  return (
    <>
      {resources.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={resourceIcon}
        >
          <Tooltip>
            <div className="font-black">{r.name}</div>
            <div className="text-xs font-bold">{typeLabel[r.type]}</div>
            {r.hours && <div className="text-xs">{r.hours}</div>}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
