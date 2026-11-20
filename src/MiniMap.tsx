import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { TILE_ATTRIBUTION, TILE_URL, categoryIcon } from "./leafletSetup";
import type { Category } from "./types";

// A static preview: all interaction is off so it never blocks scrolling the feed.
export default function MiniMap({ lat, lng, category }: { lat: number; lng: number; category: Category }) {
  return (
    <div className="map-wrap mini">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        dragging={false}
        touchZoom={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <Marker position={[lat, lng]} icon={categoryIcon(category)} />
      </MapContainer>
    </div>
  );
}
