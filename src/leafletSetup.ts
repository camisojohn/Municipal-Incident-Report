import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { CATEGORY_COLORS, type Category } from "./types";

// Fixes the missing default marker icon when bundling with Vite
L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const DEFAULT_CENTER: [number, number] = [14.5995, 120.9842];
export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION = "&copy; OpenStreetMap contributors";

// Colored dot per category. Only receives our own color constants, never user text.
export function categoryIcon(category: Category) {
  const color = CATEGORY_COLORS[category];
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.5)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}
