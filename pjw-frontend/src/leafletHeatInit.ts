/**
 * leaflet.heat expects L on window. Ensure it's set before the plugin loads.
 */
import L from "leaflet";
if (typeof window !== "undefined") {
  (window as unknown as { L: typeof L }).L = L;
}
