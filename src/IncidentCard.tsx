import { useState } from "react";
import { useAuth } from "./auth";
import { useIncidents } from "./incidents";
import MiniMap from "./MiniMap";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Incident,
  type Status,
} from "./types";
import { formatDateTime, timeAgo } from "./utils";

export default function IncidentCard({ incident }: { incident: Incident }) {
  const { user } = useAuth();
  const { updateStatus } = useIncidents();
  const isAdmin = user?.role === "admin";

  const [showMap, setShowMap] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [status, setStatus] = useState<Status>(incident.status);
  const [note, setNote] = useState("");

  const latest = incident.history[incident.history.length - 1];
  const hasUpdates = incident.history.length > 1;
  const canSave = status !== incident.status || note.trim().length > 0;

  function save() {
    if (!user || !canSave) return;
    updateStatus(incident.id, status, note, user);
    setNote("");
  }

  return (
    <article className="card incident">
      <header className="incident-head">
        <span className="avatar" aria-hidden="true">
          {incident.authorName.charAt(0).toUpperCase()}
        </span>
        <div className="incident-who">
          <strong>{incident.authorName}</strong>
          <time className="muted" dateTime={incident.createdAt} title={formatDateTime(incident.createdAt)}>
            {timeAgo(incident.createdAt)}
          </time>
        </div>
        <span className={`badge status-${incident.status}`}>{STATUS_LABELS[incident.status]}</span>
      </header>

      <h3 className="incident-title">{incident.title}</h3>
      <p className="incident-desc">{incident.description}</p>

      {incident.image && <img className="incident-img" src={incident.image} alt={incident.title} />}

      <div className="chips">
        <span className="badge neutral">
          <span className="dot" style={{ background: CATEGORY_COLORS[incident.category] }} />
          {CATEGORY_LABELS[incident.category]}
        </span>
        <span className={`badge sev-${incident.severity}`}>{SEVERITY_LABELS[incident.severity]} severity</span>
      </div>

      {hasUpdates && (
        <div className="update-box">
          <div className="update-line">
            <strong>{STATUS_LABELS[latest.status]}</strong>
            <span className="muted">
              {" "}
              by {latest.by}, {timeAgo(latest.at)}
            </span>
          </div>
          {latest.note && <p className="update-note">{latest.note}</p>}
          <button type="button" className="link" onClick={() => setShowHistory((v) => !v)}>
            {showHistory ? "Hide history" : `View history (${incident.history.length})`}
          </button>
          {showHistory && (
            <ol className="timeline">
              {[...incident.history].reverse().map((h) => (
                <li key={h.at + h.status}>
                  <span className={`dot status-dot-${h.status}`} />
                  <div>
                    <strong>{STATUS_LABELS[h.status]}</strong>
                    <span className="muted">
                      {" "}
                      by {h.by}, {formatDateTime(h.at)}
                    </span>
                    {h.note && <p className="update-note">{h.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <div className="incident-actions">
        <button type="button" className="btn sm" onClick={() => setShowMap((v) => !v)} aria-expanded={showMap}>
          {showMap ? "Hide location" : "View location"}
        </button>
        <a
          className="btn sm"
          href={`https://www.google.com/maps/search/?api=1&query=${incident.lat},${incident.lng}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Google Maps
        </a>
      </div>

      {showMap && <MiniMap lat={incident.lat} lng={incident.lng} category={incident.category} />}

      {isAdmin && (
        <div className="admin-panel">
          <div className="admin-row">
            <label className="field grow">
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="btn primary" onClick={save} disabled={!canSave}>
              Save update
            </button>
          </div>
          <label className="field">
            <span>Note for residents (optional)</span>
            <textarea
              rows={2}
              value={note}
              maxLength={300}
              placeholder="Example: Crew dispatched, expect clearing within 2 hours."
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
      )}
    </article>
  );
}
