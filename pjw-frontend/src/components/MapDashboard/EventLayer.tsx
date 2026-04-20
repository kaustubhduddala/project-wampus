import { Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import type { DeliveryEvent } from "@/data/deliveryData";
import { format } from "date-fns";

const SIZE = 16;
const deliveryIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    background-color: #22C55E;
    width: ${SIZE}px;
    height: ${SIZE}px;
    border: 1.5px solid #000;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 1.5px 1.5px 0px #000;
  "></div>`,
  iconSize: [SIZE, SIZE],
  iconAnchor: [SIZE / 2, SIZE],
  popupAnchor: [0, -SIZE],
});

interface EventLayerProps {
  events: DeliveryEvent[];
  cluster?: boolean;
}

export default function EventLayer({ events, cluster = true }: EventLayerProps) {
  const markers = events.map((event) => (
    <Marker
      key={event.id}
      position={[event.lat, event.lng]}
      icon={deliveryIcon}
    >
      <Popup>
        <div className="font-black text-sm">Delivery #{event.id}</div>
        {/* <div className="text-[#22C55E] font-black">{event.meals_delivered} meals</div> */}
        <div className="text-xs font-bold">
          {format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm a")}
        </div>
        <div className="text-xs text-gray-600">
          {event.lat.toFixed(5)}, {event.lng.toFixed(5)}
        </div>
        {event.notes && (
          <div className="text-xs mt-1 font-bold">{event.notes}</div>
        )}
      </Popup>
    </Marker>
  ));

  if (cluster) {
    return <MarkerClusterGroup>{markers}</MarkerClusterGroup>;
  }
  return <>{markers}</>;
}
