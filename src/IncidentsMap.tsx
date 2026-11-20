import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { DEFAULT_CENTER, TILE_ATTRIBUTION, TILE_URL, categoryIcon } from "./leafletSetup";
import { useIncidents } from "./incidents";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
  type Incident,
} from "./types";
import { timeAgo } from "./utils";

// Zoom to fit all pins once, when the map first opens (so it doesn't jump while panning)
function FitToIncidents({ incidents }: { incidents: Incident[] }) {
  const map = useMap();
  const initial = useRef(incidents);

  useEffect(() => {
    if (initial.current.length === 0) return;
    const bounds = L.latLngBounds(initial.current.map((i) => [i.lat, i.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }, [map]);

  return null;
}

export default function IncidentsMap() {
  const { incidents } = useIncidents();

  return (
    <>
      <div className="map-wrap map-page">
        <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <FitToIncidents incidents={incidents} />

          {incidents.map((i) => (
            <Marker
              key={i.id}
              position={[i.lat, i.lng]}
              icon={categoryIcon(i.category)}
              opacity={i.status === "resolved" ? 0.5 : 1}
            >
              <Popup>
                <strong>{i.title}</strong>
                <br />
                {CATEGORY_LABELS[i.category]}, {SEVERITY_LABELS[i.severity]} severity
                <br />
                Status: {STATUS_LABELS[i.status]}
                <br />
                <small>{timeAgo(i.createdAt)}</small>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <ul className="legend">
        {CATEGORIES.map((c) => (
          <li key={c}>
            <span className="dot" style={{ background: CATEGORY_COLORS[c] }} />
            {CATEGORY_LABELS[c]}
          </li>
        ))}
        <li className="legend-note">Faded pins are resolved</li>
      </ul>

      {incidents.length === 0 && (
        <p className="muted center">No incidents reported yet. Reports will appear here as pins.</p>
      )}
    </>
  );
}
