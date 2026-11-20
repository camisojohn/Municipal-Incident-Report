import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";
import type { Marker as LeafletMarker } from "leaflet";
import { DEFAULT_CENTER, TILE_ATTRIBUTION, TILE_URL } from "./leafletSetup";
import MapControls, { type UserLocation } from "./MapControls";
import type { Position } from "./types";

function ClickHandler({ onPick }: { onPick: (p: Position) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

type Props = {
  value: Position | null;
  onChange: (p: Position) => void;
};

export default function LocationPicker({ value, onChange }: Props) {
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);

  return (
    <div className="map-wrap picker">
      <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <ClickHandler onPick={onChange} />
        <MapControls onLocated={setUserLoc} onPick={onChange} />

        {userLoc && (
          <>
            <Circle
              center={[userLoc.lat, userLoc.lng]}
              radius={userLoc.accuracy}
              pathOptions={{ color: "#2563eb", weight: 1, fillOpacity: 0.1 }}
            />
            <CircleMarker
              center={[userLoc.lat, userLoc.lng]}
              radius={7}
              pathOptions={{ color: "#fff", weight: 2, fillColor: "#2563eb", fillOpacity: 1 }}
            />
          </>
        )}

        {value && (
          <Marker
            position={[value.lat, value.lng]}
            draggable
            eventHandlers={{
              dragend(e) {
                const { lat, lng } = (e.target as LeafletMarker).getLatLng();
                onChange({ lat, lng });
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
