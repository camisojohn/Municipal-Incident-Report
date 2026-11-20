import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { Position } from "./types";

export type UserLocation = Position & { accuracy: number };

type Props = {
  onLocated: (loc: UserLocation) => void; // shows the blue dot
  onPick: (p: Position) => void; // drops the incident pin
};

type SearchResult = { id: number; name: string; lat: number; lng: number };

export default function MapControls({ onLocated, onPick }: Props) {
  const map = useMap();
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Stop clicks and scrolls on these controls from reaching the map underneath
  useEffect(() => {
    if (boxRef.current) {
      L.DomEvent.disableClickPropagation(boxRef.current);
      L.DomEvent.disableScrollPropagation(boxRef.current);
    }
  }, []);


  // Fly to a spot, but place it below the center so the search panel doesn't cover the pin
  function flyToPin(lat: number, lng: number) {
    const zoom = 17;
    const target = map.unproject(map.project([lat, lng], zoom).subtract([0, 70]), zoom);
    map.flyTo(target, zoom);
  }

  function locate() {
    if (!("geolocation" in navigator)) {
      setMessage("This browser doesn't support location. Search an address instead.");
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
        onPick({ lat: loc.lat, lng: loc.lng });
        flyToPin(loc.lat, loc.lng);
        setMessage(
          loc.accuracy > 100
            ? `Low accuracy (about ${Math.round(loc.accuracy)} m). Drag the pin to the exact spot.`
            : "Pin placed on your location. Drag it to adjust."
        );
        setBusy(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Location is blocked. Allow it in your browser's site settings, or search an address.",
          2: "Location unavailable. Try again or search an address.",
          3: "Location timed out. Try again or search an address.",
        };
        setMessage(messages[err.code] ?? "Could not get your location.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function search(e: FormEvent) {
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
    flyToPin(r.lat, r.lng);
    onPick({ lat: r.lat, lng: r.lng });
    setResults([]);
    setQuery("");
    setMessage("Pin placed. Drag it to adjust.");
  }

  return (
    <div ref={boxRef} className="map-controls">
      <form onSubmit={search} className="map-controls-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search barangay, street, landmark"
          aria-label="Search a place"
        />
        <button type="submit" className="btn sm" disabled={busy}>
          Search
        </button>
      </form>

      <button type="button" className="btn sm primary" onClick={locate} disabled={busy}>
        Use my location
      </button>

      {message && <small className="map-controls-msg">{message}</small>}

      {results.length > 0 && (
        <ul className="map-results">
          {results.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => choose(r)}>
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
