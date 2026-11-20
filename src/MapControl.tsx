import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { Position } from "./types";

export type UserLocation = Position & { accuracy: number };

type Props = {
  onLocated: (loc: UserLocation) => void; // shows the blue dot
  onPick: (p: Position) => void;          // drops the incident pin
};

type SearchResult = { id: number; name: string; lat: number; lng: number };

export default function MapControls({ onLocated, onPick }: Props) {
  const map = useMap();
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Without this, clicking these controls would also drop a pin on the map
  useEffect(() => {
    if (boxRef.current) {
      L.DomEvent.disableClickPropagation(boxRef.current);
      L.DomEvent.disableScrollPropagation(boxRef.current);
    }
  }, []);

  function locate(thenPin: boolean) {
    if (!("geolocation" in navigator)) {
      setMessage("Your browser doesn't support location.");
      return;
    }
    setBusy(true);
    setMessage("Finding your location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        onLocated(loc);
        map.flyTo([loc.lat, loc.lng], 17);
        if (thenPin) onPick({ lat: loc.lat, lng: loc.lng });

        setMessage(
          loc.accuracy > 100
            ? `Low accuracy (±${Math.round(loc.accuracy)} m). Drag the pin to adjust.`
            : `Located (±${Math.round(loc.accuracy)} m).`
        );
        setBusy(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Location permission denied. Allow it in your browser's site settings.",
          2: "Location unavailable. Try again or search an address.",
          3: "Location request timed out. Try again.",
        };
        setMessage(messages[err.code] ?? "Could not get your location.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 3) {
      setMessage("Type at least 3 characters.");
      return;
    }
    setBusy(true);
    setMessage("Searching...");
    setResults([]);

    try {
      const url =
        "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=ph&q=" +
        encodeURIComponent(q);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Bad response");

      const data: { place_id: number; display_name: string; lat: string; lon: string }[] =
        await res.json();

      setResults(
        data.map((d) => ({
          id: d.place_id,
          name: d.display_name,
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
        }))
      );
      setMessage(data.length ? "" : "No results. Try a barangay, street, or landmark name.");
    } catch {
      setMessage("Search failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function choose(r: SearchResult) {
    map.flyTo([r.lat, r.lng], 17);
    onPick({ lat: r.lat, lng: r.lng });
    setResults([]);
    setQuery("");
    setMessage("");
  }

  return (
    <div ref={boxRef} style={box}>
      <form onSubmit={search} style={{ display: "flex", gap: 6 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search barangay, street, landmark"
          style={{ flex: 1, minWidth: 0 }}
        />
        <button type="submit" disabled={busy}>Search</button>
      </form>

      <div style={{ display: "flex", gap: 6 }}>
        <button type="button" onClick={() => locate(false)} disabled={busy}>
          📍 My location
        </button>
        <button type="button" onClick={() => locate(true)} disabled={busy}>
          ➕ Report here
        </button>
      </div>

      {message && <small>{message}</small>}

      {results.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => choose(r)}
                style={{ width: "100%", textAlign: "left" }}
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const box: React.CSSProperties = {
  position: "absolute",
  top: 12,
  left: 60, // leaves room for Leaflet's zoom buttons
  zIndex: 1000,
  width: "min(340px, calc(100vw - 80px))",
  background: "#fff",
  color: "#111",
  padding: 10,
  borderRadius: 8,
  boxShadow: "0 2px 12px rgba(0,0,0,.3)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};