import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import ReportForm from "./ReportForm";
import MapControls, { type UserLocation } from "./MapControl";
import { CATEGORY_COLORS, type Incident, type IncidentInput, type Position } from "./types";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function categoryIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.5)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function ClickHandler({ onPick }: { onPick: (p: Position) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapView() {
  const [picked, setPicked] = useState<Position | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);

  function handleSubmit(data: IncidentInput) {
    const incident: Incident = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "unverified",
      flagCount: 0,
    };
    setIncidents((prev) => [...prev, incident]);
    setPicked(null);
  }

  return (
    <>
      <MapContainer center={[14.5995, 120.9842]} zoom={12} style={{ height: "100vh", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <ClickHandler onPick={setPicked} />
        <MapControls onLocated={setUserLoc} onPick={setPicked} />

        {/* Blue dot + accuracy circle for the user's location */}
        {userLoc && (
          <>
            <Circle
              center={[userLoc.lat, userLoc.lng]}
              radius={userLoc.accuracy}
              pathOptions={{ color: "#1d7bd8", weight: 1, fillOpacity: 0.1 }}
            />
            <CircleMarker
              center={[userLoc.lat, userLoc.lng]}
              radius={8}
              pathOptions={{ color: "#fff", weight: 2, fillColor: "#1d7bd8", fillOpacity: 1 }}
            />
          </>
        )}

        {/* Draggable pin for the new report */}
        {picked && (
          <Marker
            position={[picked.lat, picked.lng]}
            draggable
            eventHandlers={{
              dragend(e) {
                const { lat, lng } = (e.target as L.Marker).getLatLng();
                setPicked({ lat, lng });
              },
            }}
          />
        )}

        {incidents.map((i) => (
          <Marker key={i.id} position={[i.lat, i.lng]} icon={categoryIcon(CATEGORY_COLORS[i.category])}>
            <Popup>
              <strong>{i.title}</strong>
              <br />
              {i.category.replace("_", " ")} · {i.severity} · {i.status}
              <br />
              {i.description}
              <br />
              <small>{new Date(i.occurredAt).toLocaleString()}</small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {picked && (
        <ReportForm position={picked} onSubmit={handleSubmit} onCancel={() => setPicked(null)} />
      )}
    </>
  );
}